# Mermaid Visualizer

A real-time collaborative Mermaid diagram editor and visualizer built with Next.js, featuring live rendering, WebSocket synchronization, and an integrated chat interface.

## Features

- **Real-time Diagram Editing**: Edit Mermaid syntax in a Monaco-powered editor with instant preview
- **Live Rendering**: Automatic diagram updates as you type
- **Collaborative Sync**: WebSocket-based synchronization for multi-user editing
- **Resizable Panels**: Adjustable layout with editor, diagram viewer, and chat sidebar
- **Integrated Chat**: AI-powered chat interface for diagram assistance
- **Session-based User IDs**: Unique user identification per browser session
- **Error Handling**: Clear feedback for invalid Mermaid syntax

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Diagrams**: Mermaid.js
- **Styling**: Tailwind CSS
- **UI Components**: Re-resizable for panel management
- **Real-time**: WebSocket for diagram synchronization
- **Backend Integration**: REST API for chat functionality

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

## Backend

This application uses the [Mermaid Drawer AI](https://github.com/nikhildhole/mermaid-drawer-ai) backend service, which provides:

- **AI-Powered Diagram Generation**: Uses Google's Gemini 2.5 Flash model to create Mermaid diagrams from natural language descriptions
- **Real-Time Collaboration**: WebSocket support for live updates and multi-user diagram editing
- **Streaming Chat Responses**: Server-Sent Events for real-time AI assistance
- **User-Specific Storage**: Isolated diagram storage per user

The backend must be running on `http://localhost:8000` and provides:
- **Chat API**: `POST /ask` - AI-powered diagram generation and assistance
- **WebSocket**: `ws://127.0.0.1:8000/mermaid` - Real-time diagram synchronization

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mermaid-visualizer
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Editing Diagrams**: Use the left panel to edit Mermaid syntax in the Monaco editor
2. **Viewing Diagrams**: The middle panel displays the rendered diagram in real-time
3. **Chat Assistance**: Use the right panel to interact with the AI chat for help with diagrams
4. **Resizing Panels**: Drag the borders between panels to adjust their sizes
5. **Real-time Sync**: Changes are synchronized across connected users via WebSocket

### Example Mermaid Syntax

The app starts with a sample flowchart. You can edit it or create new diagrams using Mermaid syntax:

```mermaid
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Do something]
    B -->|No| D[Do something else]
    C --> E[End]
    D => E
```

## Backend Requirements

This application requires a backend service running on port 8000 that provides:

- **Chat API**: `POST /ask` - Handles chat messages and returns streaming responses
- **WebSocket**: `ws://127.0.0.1:8000/mermaid` - Manages real-time diagram synchronization

The backend should handle user sessions and diagram state persistence.

## Project Structure

```
mermaid-visualizer/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API proxy
│   │   └── websocket/     # WebSocket service
│   ├── components/
│   │   ├── ChatSidebar.tsx
│   │   ├── MermaidDiagramRenderer.tsx
│   │   ├── MermaidEditor.tsx
│   │   └── ResizablePanels.tsx
│   ├── utils/
│   │   └── userId.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── types/
│   ├── routes.d.ts
│   └── validator.ts
├── public/
└── package.json
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request