import express from "express";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = app.listen(8000, () => {
  console.log("websocket server is listening on port 8000");
});

app.get("/", (req, res) => {
  res.send("Home ");
});

// let allSocket: WebSocket[] = [];
let allSockets = new Map<string, WebSocket[]>();
// let allSockets =  {
//   "room1": [socket2, socket4 , socket5],
//   "room4": [socket1],
//   "romm2": [socket7, socket10]
// }

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("error", (error) => console.log(error));

  // allSockets.set("room1", [...(allSockets.get("room1") ?? []), ws]);

  ws.on("message", (msg) => {
    //Message Schema from user side
    // {
    //   "type": "join",
    //   "payload": {
    //     "roomId": "room1"
    //   }
    // }
    // {
    //   "type": "chat",
    //   "payload": {
    //     "message": "hi there"
    //   }
    // }

    const parsedMessage = JSON.parse(msg.toString());

    if (parsedMessage.type === "join") {
      if (allSockets.get(parsedMessage.payload.roomId)?.includes(ws)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "you are already in this room",
          }),
        );
      } else {
        allSockets.set(parsedMessage.payload.roomId, [
          ...(allSockets.get(parsedMessage.payload.roomId) ?? []),
          ws,
        ]);

        ws.send(
          JSON.stringify({
            type: "success",
            message: `you are add to room ${parsedMessage.payload.roomId}`,
          }),
        );
      }
    }

    if (parsedMessage.type === "chat") {
      let userFound = false;
      for (let [key, value] of allSockets) {
        if (value.includes(ws)) {
          userFound = true;
          allSockets.get(key)?.forEach((user) => {
            if (user.readyState == ws.OPEN) {
              user.send(
                JSON.stringify({
                  type: "chat",
                  message: `${parsedMessage.payload.message}`,
                }),
              );
            }
          });
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "you are not in any room",
            }),
          );
        }
      }
    }
  });

  ws.on("close", () => {
    for (let [roomId, socket] of allSockets) {
      const updatedSocket = socket.filter((soc) => soc != ws);

      if (updatedSocket.length === 0) {
        allSockets.delete(roomId);
      } else {
        allSockets.set(roomId, updatedSocket);
      }
    }
  });
});
