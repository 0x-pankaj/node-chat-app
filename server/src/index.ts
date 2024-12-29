import express from "express";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = app.listen(8000, () => {
  console.log("websocket server is listening on port 8000");
});

app.get("/", (req, res) => {
  res.send("Home ");
});

let userCount = 0;
let allSocket: WebSocket[] = [];

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("error", (error) => console.log(error));

  userCount += 1;
  allSocket.push(ws);
  console.log("websocket server connected");
  console.log("userCount: ", userCount);

  ws.on("message", (msg) => {
    wss.clients.forEach(async (client) => {
      await new Promise((res) => setTimeout(res, 2000));
      ws.send(msg.toString());
    });
  });

  ws.send(`userCount:  ${userCount} `);
});
