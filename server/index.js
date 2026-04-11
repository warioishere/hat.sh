const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const { generateRoomCode } = require("./words");

const PORT = process.env.PORT || 8080;
const ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// TURN server config (shared secret)
const TURN_URL = process.env.TURN_URL || "";
const TURN_SECRET = process.env.TURN_SECRET || "";
const TURN_TTL = 86400; // credentials valid for 24h

function generateTurnCredentials() {
  if (!TURN_URL || !TURN_SECRET) return null;
  const timestamp = Math.floor(Date.now() / 1000) + TURN_TTL;
  const username = timestamp.toString();
  const credential = crypto
    .createHmac("sha1", TURN_SECRET)
    .update(username)
    .digest("base64");
  return { urls: TURN_URL, username, credential };
}

const rooms = new Map();

const http = require("http");
const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  // Accept connections on any path (/signal, /, etc.)
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

server.listen(PORT);

console.log(`Signaling server running on port ${PORT}`);
if (TURN_URL) {
  console.log(`TURN server configured: ${TURN_URL}`);
} else {
  console.log("No TURN server configured (STUN only)");
}

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
        const turn = generateTurnCredentials();
        ws.send(JSON.stringify({ type: "room-created", room, turn }));
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
        const turn = generateTurnCredentials();
        ws.send(JSON.stringify({ type: "joined", turn }));
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
          other.send(JSON.stringify({ type: "peer-disconnected" }));
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
