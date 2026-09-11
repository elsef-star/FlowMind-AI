# Visual AI Workflow

A visual flowchart-based AI workflow system where each node represents an AI decision step returning strictly **YES** or **NO**. Built with Next.js, React Flow, Inngest, and OpenAI.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:
```
OPENAI_API_KEY=sk-your-openai-api-key
INNGEST_DEV=1              # enables local dev mode for the Inngest SDK
```

Optional (only needed if you push runs to Inngest Cloud):
```
INNGEST_SIGNING_KEY=signkey-your-inngest-signing-key
INNGEST_EVENT_KEY=your-inngest-event-key
```

To get Inngest Cloud keys: visit [https://app.inngest.com](https://app.inngest.com), create a project, and copy the keys from the project settings. For a purely local setup these are <strong>not required</strong> — just leave `INNGEST_DEV=1` in place.

### 3. Run Development Servers

Open **two terminals** in the project root:

**Terminal 1 — Next.js:**
```bash
npm run dev
```

**Terminal 2 — Inngest:**
```bash
npx inngest-cli@latest dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## How It Works

### Visual Editor

- **Add nodes:** Click anywhere on the canvas to add a new prompt node.
- **Edit nodes:** Click inside a node to edit its label and AI prompt.
- **Connect nodes:** Drag from the **YES** handle (right, green) or **NO** handle (bottom, red) to another node.
- **Delete nodes:** Select a node and press `Backspace` or `Delete`, or click the trash icon.
- **Pan/Zoom:** Use mouse drag or the minimap to navigate.

### Running a Workflow

1. Enter sample input data in the **Input Data** field (top-left).
2. Click **Run Workflow** — this triggers an Inngest function that:
   - Starts at the first node
   - Sends the node's prompt + input to OpenAI (GPT-4o-mini)
   - Forces a strict YES or NO response
   - Follows the corresponding branch to the next node
   - Continues until no more branches exist
3. Nodes update in real-time: green = YES, red = NO, yellow = currently running.
4. The **Execution Log** panel (right side) shows step-by-step results.

### JSON Export/Import

- **Export:** Saves the current workflow to a JSON file and copies to clipboard.
- **Import:** Load a previously exported JSON workflow.

## Project Structure

```
visual-ai-workflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── inngest/route.ts   # Inngest handler
│   │   │   └── run/route.ts       # Start workflow runs
│   │   │       └── [graphId]/     # Poll run status
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── edges/DecisionEdge.tsx
│   │   ├── nodes/PromptNode.tsx
│   │   ├── panels/Toolbar.tsx
│   │   ├── panels/LogsPanel.tsx
│   │   ├── ui/                     # Shadcn components
│   │   └── WorkflowCanvas.tsx
│   ├── inngest/
│   │   ├── client.ts
│   │   └── functions/workflow.ts   # Core execution engine
│   ├── lib/
│   │   ├── executionStore.ts       # In-memory execution state
│   │   ├── openai.ts              # OpenAI integration
│   │   ├── runWorkflow.ts         # Client-side runner + polling
│   │   ├── store.ts               # Zustand graph store
│   │   └── utils.ts
│   └── types/workflow.ts
├── .env.example
├── package.json
└── tailwind.config.ts
```

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| React Flow (@xyflow/react) | Visual flow editor |
| Zustand | State management |
| Inngest | Background workflow execution |
| OpenAI (GPT-4o-mini) | AI decision engine |
| Tailwind CSS + Shadcn | Styling and UI components |
