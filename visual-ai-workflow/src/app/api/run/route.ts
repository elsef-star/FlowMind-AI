import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { WorkflowEdge, WorkflowNode } from "@/types/workflow";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges, input, graphId } = body as {
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      input: string;
      graphId: string;
    };

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: "No workflow nodes provided" },
        { status: 400 }
      );
    }

    try {
      await inngest.send({
        name: "workflow/run",
        data: {
          graphId,
          nodes,
          edges: edges || [],
          input: input || "",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const hint = message.includes("fetch failed")
        ? "Could not reach the Inngest dev server. Make sure it is running: npx inngest-cli@latest dev"
        : `Inngest error: ${message}`;
      return NextResponse.json({ error: hint }, { status: 500 });
    }

    return NextResponse.json({ success: true, graphId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start run" },
      { status: 500 }
    );
  }
}