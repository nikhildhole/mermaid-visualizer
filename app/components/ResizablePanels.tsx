"use client";

import { useState, useRef, useEffect } from "react";
import MermaidEditor from "./MermaidEditor";
import ChatSidebar from "./ChatSidebar";
import MermaidDiagramRenderer from "./MermaidDiagramRenderer";
import { mermaidWebSocketService } from "../api/websocket/mermaidWebSocket";
import { getUserId } from "../utils/userId";

type Panel = "left" | "middle" | "right";

export default function ResizableThreePanels() {
    const initialChart = `flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Do something]
    B -->|No| D[Do something else]
    C --> E[End]
    D => E`;

    const [chartText, setChartText] = useState(initialChart);
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState("");

    // Initialize user ID on component mount
    useEffect(() => {
        const id = getUserId();
        setUserId(id);
        console.log("User ID initialized:", id);
    }, []);

    // WebSocket connection and sync
    useEffect(() => {
        if (!userId) return; // Wait for userId to be initialized

        mermaidWebSocketService.connect(
            (content) => setChartText(content),
            (connected) => setIsConnected(connected),
            userId
        );

        // Cleanup on unmount
        return () => {
            mermaidWebSocketService.disconnect();
        };
    }, [userId]);

    // Send diagram updates to server
    const handleChartChange = (newChart: string) => {
        setChartText(newChart);
        mermaidWebSocketService.sendUpdate(newChart);
    };

    const [leftWidth, setLeftWidth] = useState(33.3);
    const [middleWidth, setMiddleWidth] = useState(33.3);
    const [visible, setVisible] = useState({
        left: true,
        middle: true,
        right: true,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const dragState = useRef<{ dragging: null | "left" | "right" }>({ dragging: null });

    const startDrag = (panel: "left" | "right") => {
        dragState.current.dragging = panel;
    };

    const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragState.current.dragging || !containerRef.current) return;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const rect = containerRef.current.getBoundingClientRect();
        const totalWidth = rect.width;
        const relativeX = ((clientX - rect.left) / totalWidth) * 100;

        if (dragState.current.dragging === "left") {
            const newLeft = Math.max(10, Math.min(relativeX, 80));
            const rightEdgeOfMiddle = leftWidth + middleWidth;
            if (newLeft < rightEdgeOfMiddle - 10) {
                const newMiddle = rightEdgeOfMiddle - newLeft;
                setLeftWidth(newLeft);
                setMiddleWidth(newMiddle);
            }
        } else if (dragState.current.dragging === "right") {
            const newRightStart = Math.max(leftWidth + 10, Math.min(relativeX, 90));
            const newMiddle = newRightStart - leftWidth;
            setMiddleWidth(newMiddle);
        }
    };

    const stopDrag = () => {
        dragState.current.dragging = null;
    };

    const closePanel = (panel: Panel) => {
        setVisible((prev) => ({ ...prev, [panel]: false }));
    };

    const activePanels = Object.values(visible).filter(Boolean).length;

    const getWidth = (panel: Panel): string => {
        if (!visible[panel]) return "0";
        if (activePanels === 1) return "100%";
        if (activePanels === 2) {
            if (panel === "left" && visible.left && !visible.middle)
                return `${leftWidth + middleWidth}%`;
            if (panel === "middle" && visible.middle && !visible.right)
                return `${middleWidth + (100 - (leftWidth + middleWidth))}%`;
            return "50%";
        }
        if (panel === "left") return `${leftWidth}%`;
        if (panel === "middle") return `${middleWidth}%`;
        return `${100 - (leftWidth + middleWidth)}%`;
    };

    return (
        <div
            ref={containerRef}
            className="flex w-full h-screen border border-gray-300 select-none overflow-hidden"
            onMouseMove={onDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchMove={onDrag}
            onTouchEnd={stopDrag}
        >
            {/* LEFT PANEL */}
            {visible.left && (
                <div
                    className="relative bg-gray-100 overflow-auto transition-all duration-200"
                    style={{ width: getWidth("left") }}
                >
                    <button
                        onClick={() => closePanel("left")}
                        className="absolute top-2 right-2 z-10 p-1 text-gray-500 hover:text-red-500"
                    >
                        ✖
                    </button>
                    <div className="absolute bottom-2 left-2 z-10 text-xs">
                        <span className={`px-2 py-1 rounded ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                        </span>
                    </div>
                    <MermaidEditor chartInText={chartText} onChange={handleChartChange} />
                </div>
            )}

            {/* Divider 1 */}
            {visible.left && visible.middle && (
                <div
                    className="w-1 bg-gray-400 cursor-col-resize hover:bg-blue-500 transition"
                    onMouseDown={() => startDrag("left")}
                    onTouchStart={() => startDrag("left")}
                ></div>
            )}

            {/* MIDDLE PANEL */}
            {visible.middle && (
                <div
                    className="relative bg-gray-50 p-4 overflow-auto transition-all duration-200"
                    style={{ width: getWidth("middle") }}
                >
                    <button
                        onClick={() => closePanel("middle")}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                        ✖
                    </button>
                    <MermaidDiagramRenderer chartInText={chartText} />
                </div>
            )}

            {/* Divider 2 */}
            {visible.middle && visible.right && (
                <div
                    className="w-1 bg-gray-400 cursor-col-resize hover:bg-blue-500 transition"
                    onMouseDown={() => startDrag("right")}
                    onTouchStart={() => startDrag("right")}
                ></div>
            )}

            {/* RIGHT PANEL */}
            {visible.right && (
                <div
                    className="relative bg-white overflow-auto transition-all duration-200 flex-1"
                    style={{ width: getWidth("right") }}
                >
                    <button
                        onClick={() => closePanel("right")}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                        ✖
                    </button>
                    <ChatSidebar />
                </div>
            )}
        </div>
    );
}
