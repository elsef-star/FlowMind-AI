"use client";

import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { Toolbar } from "@/components/panels/Toolbar";
import { LogsPanel } from "@/components/panels/LogsPanel";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-50">
      <WorkflowCanvas />
      <Toolbar />
      <LogsPanel />

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-[10px] font-medium text-slate-400 shadow-sm backdrop-blur-sm">
        Click anywhere on the canvas to add a node · Drag from handles to
        connect
      </div>
    </main>
  );
}