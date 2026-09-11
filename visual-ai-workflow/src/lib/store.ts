import { create } from "zustand";
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowGraph,
  ExecutionLog,
} from "@/types/workflow";
import {
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  addEdge,
  Node,
} from "@xyflow/react";

let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node_${Date.now()}_${nodeIdCounter++}`;
}

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executionLog: ExecutionLog | null;
  executionState: Record<string, "idle" | "running" | "yes" | "no" | "error">;
  isRunning: boolean;
  inputText: string;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (position?: { x: number; y: number }) => string;
  updateNodePrompt: (nodeId: string, prompt: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  setExecutionState: (
    state: Record<string, "idle" | "running" | "yes" | "no" | "error">
  ) => void;
  setExecutionLog: (log: ExecutionLog | null) => void;
  setIsRunning: (running: boolean) => void;
  setInputText: (text: string) => void;
  applyLiveUpdate: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  loadGraph: (graph: WorkflowGraph) => void;
  getGraph: () => WorkflowGraph;
  resetAll: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  executionLog: null,
  executionState: {},
  isRunning: false,
  inputText: "",

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes as Node[]) as WorkflowNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;

    const existingEdgesFromSource = get().edges.filter(
      (e) => e.source === connection.source
    );
    if (existingEdgesFromSource.length >= 2) return;

    const hasYes = existingEdgesFromSource.some(
      (e) => e.label === "YES" || e.sourceHandle === "YES"
    );
    const handleId = connection.sourceHandle?.toString().toUpperCase();
    const label =
      handleId === "NO"
        ? "NO"
        : handleId === "YES"
        ? "YES"
        : hasYes
        ? "NO"
        : "YES";

    const newEdge: WorkflowEdge = {
      ...connection,
      id: `edge_${connection.source}_${connection.target}_${label}`,
      label,
      animated: false,
      style: {
        stroke: label === "YES" ? "#22c55e" : "#ef4444",
        strokeWidth: 2,
      },
      labelStyle: {
        fill: label === "YES" ? "#16a34a" : "#dc2626",
        fontWeight: 700,
        fontSize: 12,
      },
      labelBgStyle: {
        fill: "white",
        fillOpacity: 0.9,
      },
    };

    set({ edges: addEdge(newEdge, get().edges) });
  },

  addNode: (position) => {
    const id = generateNodeId();
    const count = get().nodes.length;
    const newNode: WorkflowNode = {
      id,
      type: "promptNode",
      position: position || { x: 250, y: (count + 1) * 150 },
      data: {
        id,
        prompt: "",
        label: `Step ${count + 1}`,
        status: "idle",
      },
    };
    set({ nodes: [...get().nodes, newNode] });
    return id;
  },

  updateNodePrompt: (nodeId, prompt) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, prompt } } : n
      ),
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    });
  },

  setExecutionState: (state) => set({ executionState: state }),
  setExecutionLog: (log) => set({ executionLog: log }),
  setIsRunning: (running) => set({ isRunning: running }),
  setInputText: (text) => set({ inputText: text }),

  loadGraph: (graph) => {
    nodeIdCounter = 0;
    set({
      nodes: graph.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" as const, result: undefined },
      })),
      edges: graph.edges,
      executionLog: null,
      executionState: {},
      isRunning: false,
    });
  },

  applyLiveUpdate: (nodes, edges) => {
    set({ nodes, edges });
  },

  getGraph: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  resetAll: () => {
    set({
      nodes: get().nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" as const, result: undefined },
      })),
      executionLog: null,
      executionState: {},
      isRunning: false,
    });
  },
}));