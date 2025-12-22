const WS_URL = "ws://127.0.0.1:8000/mermaid";

type WebSocketMessage = {
    type: "get" | "update" | "current" | "acknowledged" | "code_updated";
    content?: string;
    message?: string;
    user_id?: string;
};

type WebSocketCallback = (content: string) => void;
type ConnectionCallback = (connected: boolean) => void;


class MermaidWebSocketService {
    private ws: WebSocket | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private onContentUpdate: WebSocketCallback | null = null;
    private onConnectionChange: ConnectionCallback | null = null;
    private isConnected = false;
    private userId: string = "";

    connect(
        onContentUpdate: WebSocketCallback,
        onConnectionChange: ConnectionCallback,
        userId: string
    ) {
        this.onContentUpdate = onContentUpdate;
        this.onConnectionChange = onConnectionChange;
        this.userId = userId;
        this.connectWebSocket();
    }

    private connectWebSocket() {
        try {
            const ws = new WebSocket(WS_URL);
            this.ws = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
                this.isConnected = true;
                this.onConnectionChange?.(true);

                // Request current diagram from server with user ID
                ws.send(JSON.stringify({ type: "get", user_id: this.userId }));
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    console.log("WebSocket message received:", data);

                    if (data.type === "current" && data.content !== undefined) {
                        this.onContentUpdate?.(data.content);
                    } else if (data.type === "code_updated" && data.content !== undefined) {
                        // Handle real-time updates from server
                        this.onContentUpdate?.(data.content);
                    } else if (data.type === "acknowledged") {
                        console.log("Server acknowledged update:", data.message);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
                this.isConnected = false;
                this.onConnectionChange?.(false);
                this.ws = null;

                // Attempt to reconnect after 3 seconds
                this.reconnectTimeout = setTimeout(() => {
                    console.log("Attempting to reconnect...");
                    this.connectWebSocket();
                }, 3000);
            };
        } catch (error) {
            console.error("Error creating WebSocket:", error);
            this.isConnected = false;
            this.onConnectionChange?.(false);
        }
    }

    sendUpdate(content: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                JSON.stringify({
                    type: "update",
                    content: content,
                    user_id: this.userId,
                })
            );
        }
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Export a singleton instance
export const mermaidWebSocketService = new MermaidWebSocketService();
