const { WebSocketServer } = require("ws");
const { generateRoomCode } = require("./words");

const PORT = process.env.PORT || 8080;
const ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const rooms = new Map();

const wss = new WebSocketServer({ port: PORT });

console.log(`Signaling server running on port ${PORT}`);

wss.on("connection", (ws) => {
  let currentRoom = null;
  let role = null;

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    switch (msg.type) {
      case "create": {
        const room = generateRoomCode();
        rooms.set(room, {
          sender: ws,
          receiver: null,
          created: Date.now(),
        });
        currentRoom = room;
        role = "sender";
        ws.send(JSON.stringify({ type: "created", room }));
        break;
      }

      case "join": {
        const roomData = rooms.get(msg.room);
        if (!roomData) {
          ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
          return;
        }
        if (roomData.receiver) {
          ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
          return;
        }
        roomData.receiver = ws;
        currentRoom = msg.room;
        role = "receiver";
        ws.send(JSON.stringify({ type: "joined" }));
        roomData.sender.send(JSON.stringify({ type: "peer-joined" }));
        break;
      }

      case "signal": {
        const roomData = rooms.get(currentRoom);
        if (!roomData) return;
        const target = role === "sender" ? roomData.receiver : roomData.sender;
        if (target && target.readyState === 1) {
          target.send(JSON.stringify({ type: "signal", data: msg.data }));
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    if (currentRoom) {
      const roomData = rooms.get(currentRoom);
      if (roomData) {
        const other = role === "sender" ? roomData.receiver : roomData.sender;
        if (other && other.readyState === 1) {
          other.send(JSON.stringify({ type: "peer-left" }));
        }
        rooms.delete(currentRoom);
      }
    }
  });
});

// Cleanup stale rooms
setInterval(() => {
  const now = Date.now();
  for (const [room, data] of rooms) {
    if (now - data.created > ROOM_TIMEOUT) {
      if (data.sender && data.sender.readyState === 1) data.sender.close();
      if (data.receiver && data.receiver.readyState === 1) data.receiver.close();
      rooms.delete(room);
    }
  }
}, 60000);
