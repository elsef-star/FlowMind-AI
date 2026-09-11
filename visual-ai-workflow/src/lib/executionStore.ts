import { ExecutionLog } from "@/types/workflow";

const executions = new Map<string, ExecutionLog>();

export function createExecution(runId: string): void {
  executions.set(runId, {
    id: runId,
    status: "running",
    startedAt: new Date().toISOString(),
    steps: [],
  });
}

export function appendStep(runId: string, step: ExecutionLog["steps"][number]): void {
  const execution = executions.get(runId);
  if (!execution) return;
  execution.steps.push(step);
}

export function completeExecution(runId: string, finalResult?: string): void {
  const execution = executions.get(runId);
  if (!execution) return;
  execution.status = "completed";
  execution.completedAt = new Date().toISOString();
  execution.finalResult = finalResult;
}

export function failExecution(runId: string, error: string): void {
  const execution = executions.get(runId);
  if (!execution) return;
  execution.status = "error";
  execution.completedAt = new Date().toISOString();
  execution.error = error;
}

export function getExecution(runId: string): ExecutionLog | null {
  return executions.get(runId) ?? null;
}