import { ExecutionLog, WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { useWorkflowStore } from "@/lib/store";

const POLL_INTERVAL_MS = 1000;

export async function runWorkflow(): Promise<void> {
  const store = useWorkflowStore.getState();
  const graph = store.getGraph();

  if (graph.nodes.length === 0 || store.isRunning) return;

  const graphId = `run_${Date.now()}`;

  store.setIsRunning(true);
  store.setExecutionLog(null);
  store.setExecutionState({});
  store.applyLiveUpdate(
    graph.nodes.map((n) => ({
      ...n,
      data: { ...n.data, status: "idle" as const, result: undefined },
    })),
    graph.edges
  );

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graphId,
        nodes: graph.nodes,
        edges: graph.edges,
        input: store.inputText,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || "Failed to start workflow");
    }

    pollStatus(graphId);
  } catch (err) {
    store.setIsRunning(false);
  }
}

async function pollStatus(graphId: string): Promise<void> {
  const store = useWorkflowStore.getState();
  if (!store.isRunning) return;

  try {
    const res = await fetch(`/api/run/status/${graphId}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      setTimeout(() => pollStatus(graphId), 750);
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch run status");
    }

    const log: ExecutionLog = await res.json();
    store.setExecutionLog(log);
    applyVisualState(graphId, log);

    if (log.status === "completed" || log.status === "error") {
      store.setIsRunning(false);
      store.setExecutionState(
        log.steps.reduce<Record<string, "yes" | "no" | "error">>(
          (acc, step) => {
            acc[step.nodeId] = step.result === "YES" ? "yes" : "no";
            return acc;
          },
          {}
        )
      );
      applyVisualState(graphId, {
        ...log,
        status: "completed",
      });
      return;
    }
  } catch (err) {
    store.setIsRunning(false);
    return;
  }

  setTimeout(() => pollStatus(graphId), POLL_INTERVAL_MS);
}

function applyVisualState(graphId: string, log: ExecutionLog): void {
  const store = useWorkflowStore.getState();
  const evaluatedNodeIds = new Set(log.steps.map((s) => s.nodeId));

  const nodes: WorkflowNode[] = store.nodes.map((node) => {
    const step = log.steps.find((s) => s.nodeId === node.id);
    const isLastStep =
      log.steps.length > 0 &&
      node.id === log.steps[log.steps.length - 1].nodeId;

    let status: "idle" | "running" | "yes" | "no" | "error" = "idle";
    if (step) {
      status = step.result === "YES" ? "yes" : "no";
    }
    if (log.status === "running" && isLastStep && step) {
      status = "running";
    }

    return {
      ...node,
      data: {
        ...node.data,
        status,
        result: step ? step.result : undefined,
      },
    };
  });

  const edges: WorkflowEdge[] = store.edges.map((edge) => {
    const sourceEvaluated = evaluatedNodeIds.has(edge.source);
    const isActiveEdge =
      log.status === "running" &&
      log.steps.length > 0 &&
      edge.source === log.steps[log.steps.length - 1].nodeId;

    return {
      ...edge,
      data: {
        ...(edge.data || {}),
        passed: sourceEvaluated,
        active: isActiveEdge,
      },
    };
  });

  store.applyLiveUpdate(nodes, edges);
  void graphId;
}