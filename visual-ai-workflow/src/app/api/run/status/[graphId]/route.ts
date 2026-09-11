import { NextRequest, NextResponse } from "next/server";
import { getExecution } from "@/lib/executionStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { graphId: string } }
) {
  const execution = getExecution(params.graphId);

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  return NextResponse.json(execution);
}