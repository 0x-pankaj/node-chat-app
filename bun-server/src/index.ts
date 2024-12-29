import { serve } from "bun";

console.log("Hello via Bun!");

const server = Bun.serve({
  fetch(req, server) {
    // Try to upgrade the connection
    const success = server.upgrade(req);
    // If upgrade successful, return undefined is fine
    if (success) {
      return undefined;
    }
    // If upgrade fails, must return a Response
    return new Response("Upgrade failed", { status: 400 });
  },
  websocket: {
    message(ws, message) {
      console.log("message received ", message);
      ws.send("hello from bun websocket");
    },
    open(ws) {
      console.log("Client connected!");
    },
    close(ws) {
      console.log("Client disconnected!");
    },
  },
});

console.log(`WebSocket server running on ws://localhost:${server.port}`);
