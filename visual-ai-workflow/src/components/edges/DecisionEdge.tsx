import { memo } from "react";
import {
  BaseEdge,
  EdgeProps,
  Position,
  getSmoothStepPath,
} from "@xyflow/react";
import { useWorkflowStore } from "@/lib/store";

interface ActiveEdgeData {
  active?: boolean;
  passed?: boolean;
}

function DecisionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const isYes = label === "YES";
  const color = isYes ? "#16a34a" : "#dc2626";
  const edgeData = (data || {}) as ActiveEdgeData;
  const isActive = Boolean(edgeData.active);
  const isPassed = Boolean(edgeData.passed);

  const strokeColor = isActive
    ? color
    : isPassed
    ? color
    : selected
    ? "#475569"
    : "#94a3b8";

  const lineStyle = isActive
    ? { stroke: color, strokeWidth: 3.5, strokeDasharray: "10 6" }
    : { stroke: strokeColor, strokeWidth: isPassed ? 2.5 : 2 };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...lineStyle,
          animation: isActive ? "flow-dash 0.8s linear infinite" : undefined,
        }}
      />
      <g transform={`translate(${labelX} ${labelY})`} pointerEvents="none">
        <circle r={9} fill="white" stroke={strokeColor} strokeWidth={1.5} />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={7}
          fontWeight={700}
          fill={strokeColor}
        >
          {label}
        </text>
      </g>
    </>
  );
}

export const DecisionEdge = memo(DecisionEdgeComponent);