"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ExecutionStep } from "@/types/workflow";

export function LogsPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const executionLog = useWorkflowStore((s) => s.executionLog);
  const isRunning = useWorkflowStore((s) => s.isRunning);

  if (!executionLog && !isRunning) return null;

  return (
    <>
      <div
        className={cn(
          "fixed right-0 top-0 z-30 flex h-full w-96 transition-all duration-300",
          isOpen ? "translate-x-0" : "translate-x-[370px]"
        )}
      >
        <div className="flex h-full w-full flex-col border-l border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                Execution Log
              </h3>
              {executionLog && (
                <Badge
                  variant={
                    executionLog.status === "completed"
                      ? "success"
                      : executionLog.status === "error"
                      ? "destructive"
                      : "secondary"
                  }
                  className="ml-1 text-[9px]"
                >
                  {executionLog.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 p-0 px-1"
            >
              <ChevronRight size={14} className="text-slate-500" />
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-3">
              {executionLog?.steps.length === 0 && isRunning && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 size={24} className="mb-3 animate-spin text-amber-500" />
                  <p className="text-xs font-medium">Executing workflow...</p>
                </div>
              )}

              {executionLog?.steps.map((step, i) => (
                <LogEntry key={i} step={step} index={i} />
              ))}

              {executionLog?.error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-red-700">
                    <XCircle size={14} />
                    Error
                  </div>
                  <p className="mt-1 text-xs text-red-600">
                    {executionLog.error}
                  </p>
                </div>
              )}

              {executionLog?.status === "completed" && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                  <CheckCircle2 size={16} className="mx-auto mb-1 text-green-600" />
                  <p className="text-xs font-semibold text-green-700">
                    Final Result:{" "}
                    <span className="font-bold">{executionLog.finalResult}</span>
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-4 z-30 flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-md transition-colors hover:bg-slate-50"
        >
          <ChevronLeft size={14} />
          Logs
          {executionLog?.steps && executionLog.steps.length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
              {executionLog.steps.length}
            </span>
          )}
        </button>
      )}
    </>
  );
}

function LogEntry({ step, index }: { step: ExecutionStep; index: number }) {
  const isYes = step.result === "YES";
  const NodeIcon = isYes ? CheckCircle2 : XCircle;

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          isYes ? "bg-green-50" : "bg-red-50"
        )}
      >
        <span className="text-[10px] font-bold text-slate-400">
          #{index + 1}
        </span>
        <span className="text-[10px] font-semibold text-slate-700">
          {step.nodeLabel}
        </span>
        <span className="ml-auto">
          <NodeIcon
            size={12}
            className={isYes ? "text-green-600" : "text-red-600"}
          />
        </span>
      </div>
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          <Clock size={10} />
          Prompt
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          {step.prompt || "(no prompt)"}
        </p>

        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Decision
        </div>
        <Badge
          variant={isYes ? "success" : "destructive"}
          className="mt-1 text-[10px]"
        >
          {step.result}
        </Badge>
      </div>
    </div>
  );
}