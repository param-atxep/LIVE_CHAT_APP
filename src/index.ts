import { WebSocketServer, WebSocket } from "ws";

type Room = {
  [key: string]: WebSocket[];
};

const wss = new WebSocketServer({ port: 8080 });
const rooms: Room = {};

wss.on("connection", (socket: WebSocket & { room?: string }) => {
  console.log("Client connected");

  socket.on("message", (msg: Buffer) => {
    const data = JSON.parse(msg.toString());

    //  JOIN / CREATE ROOM
    if (data.type === "join") {
      const room = data.room;

      if (!rooms[room]) {
        rooms[room] = [];
      }

      if (rooms[room].length >= 2) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Room full"
        }));
        return;
      }

      socket.room = room;
      rooms[room].push(socket);

      //  SEND JOIN CONFIRMATION
      socket.send(JSON.stringify({
        type: "joined",
        room
      }));

      console.log(`User joined room: ${room}`);
    }

    //  CHAT
    if (data.type === "chat") {
      const room = socket.room;
      if (!room) return;

      rooms[room].forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "chat",
            message: data.message
          }));
        }
      });
    }
  });

  socket.on("close", () => {
    const room = socket.room;
    if (!room) return;

    rooms[room] = rooms[room].filter(s => s !== socket);

    if (rooms[room].length === 0) {
      delete rooms[room];
    }

    console.log("Client disconnected");
  });
});

console.log(" Server running on ws://localhost:8080");