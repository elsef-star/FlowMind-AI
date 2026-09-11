"use client";

import { useCallback, useRef, useState } from "react";
import {
  Play,
  Plus,
  RotateCcw,
  Download,
  Upload,
  Loader2,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkflowStore } from "@/lib/store";
import { runWorkflow } from "@/lib/runWorkflow";
import { cn } from "@/lib/utils";

export function Toolbar() {
  const addNode = useWorkflowStore((s) => s.addNode);
  const isRunning = useWorkflowStore((s) => s.isRunning);
  const resetAll = useWorkflowStore((s) => s.resetAll);
  const loadGraph = useWorkflowStore((s) => s.loadGraph);
  const getGraph = useWorkflowStore((s) => s.getGraph);
  const inputText = useWorkflowStore((s) => s.inputText);
  const setInputText = useWorkflowStore((s) => s.setInputText);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportCopied, setExportCopied] = useState(false);

  const handleExport = useCallback(() => {
    const graph = getGraph();
    const data = JSON.stringify(graph, null, 2);
    navigator.clipboard.writeText(data).catch(() => {});
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  }, [getGraph]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const graph = JSON.parse(event.target?.result as string);
          if (graph.nodes && Array.isArray(graph.nodes)) {
            loadGraph(graph);
          }
        } catch (err) {
          console.error("Failed to import workflow:", err);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [loadGraph]
  );

  const handleRun = useCallback(() => {
    runWorkflow();
  }, []);

  return (
    <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
      <div className="rounded-lg border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur-sm">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Input Data
        </div>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Sample data for workflow"
          disabled={isRunning}
          className="h-8 w-56 text-xs"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur-sm">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Actions
        </div>

        <div className="flex flex-col gap-1.5">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              "h-8 w-56 text-xs font-semibold",
              isRunning && "animate-pulse"
            )}
            variant={isRunning ? "secondary" : "default"}
          >
            {isRunning ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} className="mr-2" />
                Run Workflow
              </>
            )}
          </Button>

          <Button
            onClick={() => addNode()}
            disabled={isRunning}
            variant="outline"
            className="h-8 text-xs"
          >
            <Plus size={14} className="mr-2" />
            Add Node
          </Button>

          <Button
            onClick={resetAll}
            disabled={isRunning}
            variant="ghost"
            className="h-8 text-xs"
          >
            <RotateCcw size={14} className="mr-2" />
            Reset Status
          </Button>

          <div className="h-[1px] bg-slate-100" />

          <Button
            onClick={handleExport}
            variant="outline"
            className="h-8 text-xs"
          >
            {exportCopied ? (
              <>
                <FileJson size={14} className="mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Download size={14} className="mr-2" />
                Export JSON
              </>
            )}
          </Button>

          <Button
            onClick={handleImport}
            variant="outline"
            className="h-8 text-xs"
          >
            <Upload size={14} className="mr-2" />
            Import JSON
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}