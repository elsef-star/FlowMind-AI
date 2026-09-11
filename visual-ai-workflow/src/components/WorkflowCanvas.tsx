"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PromptNode } from "@/components/nodes/PromptNode";
import { DecisionEdge } from "@/components/edges/DecisionEdge";
import { useWorkflowStore } from "@/lib/store";

const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
};

const edgeTypes: EdgeTypes = {
  decision: DecisionEdge,
};

function FlowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const isRunning = useWorkflowStore((s) => s.isRunning);

  const onPaneClick = useCallback(() => {
    if (isRunning) return;
    addNode();
  }, [addNode, isRunning]);

  return (
    <div className="relative h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        proOptions={{ hideAttribution: false }}
        defaultEdgeOptions={{ type: "decision" }}
        nodesDraggable={!isRunning}
        nodesConnectable={!isRunning}
        elementsSelectable={true}
        deleteKeyCode={isRunning ? null : ["Backspace", "Delete"]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#cbd5e1"
        />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => {
            const status = (n.data as { status?: string })?.status;
            if (status === "yes") return "#22c55e";
            if (status === "no") return "#ef4444";
            if (status === "running") return "#f59e0b";
            return "#94a3b8";
          }}
          maskColor="rgba(248, 250, 252, 0.6)"
          className="!bg-white/80"
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}