import { useState, useEffect, useRef } from "react";

interface Message {
  type: string;
  message: string;
  timestamp?: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000");

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("Connected to WebSocket");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, { ...data, timestamp: new Date() }]);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentRoom) return;

    ws.current?.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: inputMessage.trim(),
        },
      }),
    );
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <span
            className={`px-2 py-1 rounded ${isConnected ? "bg-green-500" : "bg-red-500"} text-white`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {!currentRoom ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select a Room to Join:</h2>
            <div className="grid grid-cols-2 gap-4">
              {["REACT", "GOLANG", "RUST", "WEB3"].map((room) => (
                <button
                  key={room}
                  onClick={() => {
                    ws.current?.send(
                      JSON.stringify({
                        type: "join",
                        payload: {
                          roomId: room.toLowerCase(),
                        },
                      }),
                    );
                    setCurrentRoom(room);
                  }}
                  className="p-4 text-center bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <span className="text-lg font-medium text-blue-600">
                    {room}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Current Room: {currentRoom}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md p-4 mb-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                msg.type === "error"
                  ? "bg-red-100"
                  : msg.type === "success"
                    ? "bg-green-100"
                    : "bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <span>{msg.message}</span>
                {msg.timestamp && (
                  <span className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentRoom && (
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
