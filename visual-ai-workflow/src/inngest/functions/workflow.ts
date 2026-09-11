import { inngest } from "@/inngest/client";
import { WorkflowNode, WorkflowEdge, ExecutionStep } from "@/types/workflow";
import { evaluatePrompt } from "@/lib/openai";
import {
  createExecution,
  appendStep,
  completeExecution,
  failExecution,
} from "@/lib/executionStore";

interface WorkflowRunEventData {
  graphId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  input: string;
}

function findStartNode(nodes: WorkflowNode[]): WorkflowNode | null {
  return nodes[0] ?? null;
}

function getNextNodeId(
  currentNodeId: string,
  result: "YES" | "NO",
  edges: WorkflowEdge[]
): string | null {
  const matchingEdge = edges.find(
    (e) =>
      e.source === currentNodeId &&
      (String(e.label ?? "").toUpperCase() === result ||
        String(e.sourceHandle ?? "").toUpperCase() === result)
  );
  if (matchingEdge) return matchingEdge.target;
  const anyEdge = edges.find((e) => e.source === currentNodeId);
  return anyEdge ? anyEdge.target : null;
}

export const runWorkflow = inngest.createFunction(
  {
    id: "workflow-run",
    name: "Run Visual AI Workflow",
    triggers: { event: "workflow/run" as const },
    retries: 0,
  },
  async ({ event, step }) => {
    const { graphId, nodes, edges, input } =
      event.data as WorkflowRunEventData;

    createExecution(graphId);

    try {
      let currentNode = findStartNode(nodes);
      const steps: ExecutionStep[] = [];
      let guard = 0;

      while (currentNode && guard < 50) {
        guard++;

        const nodeSnapshot = currentNode.data;
        const result = await step.run(
          `Evaluate node: ${nodeSnapshot.label || currentNode.id}`,
          async () => {
            return evaluatePrompt(nodeSnapshot.prompt || "", input);
          }
        );

        const executionStep: ExecutionStep = {
          nodeId: currentNode.id,
          nodeLabel: nodeSnapshot.label || currentNode.id,
          prompt: nodeSnapshot.prompt || "",
          result,
          input,
          timestamp: new Date().toISOString(),
        };
        steps.push(executionStep);
        appendStep(graphId, executionStep);

        const nextNodeId = getNextNodeId(currentNode.id, result, edges);
        if (!nextNodeId) break;
        currentNode = nodes.find((n) => n.id === nextNodeId) ?? null;
      }

      completeExecution(graphId, steps[steps.length - 1]?.result ?? null);

      return {
        steps,
        finalNodeId: currentNode?.id ?? null,
        finalResult: steps[steps.length - 1]?.result ?? null,
      };
    } catch (error) {
      failExecution(
        graphId,
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  }
);