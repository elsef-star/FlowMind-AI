import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Trash2, Sparkles, Circle, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  string,
  { border: string; badge: string; badgeText: string; label: string }
> = {
  idle: {
    border: "border-slate-300",
    badge: "bg-slate-100 text-slate-600",
    badgeText: "Idle",
    label: "",
  },
  running: {
    border: "border-amber-400 ring-4 ring-amber-100 animate-pulse",
    badge: "bg-amber-500 text-white",
    badgeText: "Running",
    label: "",
  },
  yes: {
    border: "border-green-500 ring-4 ring-green-100",
    badge: "bg-green-500 text-white",
    badgeText: "YES",
    label: "text-green-600",
  },
  no: {
    border: "border-red-500 ring-4 ring-red-100",
    badge: "bg-red-500 text-white",
    badgeText: "NO",
    label: "text-red-600",
  },
  error: {
    border: "border-red-600 ring-4 ring-red-100",
    badge: "bg-red-600 text-white",
    badgeText: "Error",
    label: "text-red-600",
  },
};

function PromptNodeComponent({ data, id, selected }: NodeProps) {
  const updateNodePrompt = useWorkflowStore((s) => s.updateNodePrompt);
  const updateNodeLabel = useWorkflowStore((s) => s.updateNodeLabel);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const isRunning = useWorkflowStore((s) => s.isRunning);

  const nodeData = data as { id: string; prompt: string; label: string; status: string; result?: string };
  const styles = statusStyles[nodeData.status] || statusStyles.idle;

  return (
    <div
      className={cn(
        "relative w-72 rounded-xl border-2 bg-white shadow-lg transition-all",
        styles.border,
        selected && "shadow-xl ring-2 ring-blue-300"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <input
          value={nodeData.label}
          onChange={(e) => updateNodeLabel(id, e.target.value)}
          placeholder="Step name"
          className="nodrag w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          disabled={isRunning}
        />
        <button
          onClick={() => deleteNode(id)}
          disabled={isRunning}
          className="nodrag rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Delete node"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          <Sparkles size={12} />
          AI Prompt
        </div>
        <textarea
          value={nodeData.prompt}
          onChange={(e) => updateNodePrompt(id, e.target.value)}
          placeholder={`Example: "Does the input contain a question?"`}
          disabled={isRunning}
          className="nodrag min-h-[70px] w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs leading-relaxed text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            styles.label
          )}
        >
          {nodeData.result ?? "Awaiting decision"}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            styles.badge
          )}
        >
          {nodeData.status === "running" ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Circle size={8} className="fill-current" />
          )}
          {styles.badgeText}
        </span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-slate-400"
      />

      <div className="flex items-center justify-between px-3 pb-2">
        <Handle
          id="YES"
          type="source"
          position={Position.Right}
          className="!h-3.5 !w-3.5 !border-2 !border-white !bg-green-500"
        />
        <span className="text-[9px] font-bold uppercase tracking-wide text-green-600">
          YES
        </span>
        <Handle
          id="NO"
          type="source"
          position={Position.Bottom}
          className="!h-3.5 !w-3.5 !border-2 !border-white !bg-red-500"
        />
        <span className="-mt-8 text-[9px] font-bold uppercase tracking-wide text-red-600">
          NO
        </span>
      </div>
    </div>
  );
}

export const PromptNode = memo(PromptNodeComponent);