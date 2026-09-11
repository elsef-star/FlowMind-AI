import { Node, Edge } from "@xyflow/react";

export interface WorkflowNodeData extends Record<string, unknown> {
  id: string;
  prompt: string;
  label: string;
  status: "idle" | "running" | "yes" | "no" | "error";
  result?: string;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  prompt: string;
  result: "YES" | "NO";
  input: string;
  timestamp: string;
}

export interface ExecutionLog {
  id: string;
  status: "running" | "completed" | "error";
  startedAt: string;
  completedAt?: string;
  steps: ExecutionStep[];
  finalResult?: string;
  error?: string;
}