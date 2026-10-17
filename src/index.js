
import { DurableObject } from "cloudflare:workers";

const MAX_MESSAGE = 300;
const MAX_NAME = 20;

export class ChatRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    const history = this.ctx.storage.sql.exec(
      "SELECT id, name, message FROM messages ORDER BY id DESC LIMIT 50"
    ).toArray().reverse();

    server.send(JSON.stringify({ type: "history", messages: history }));

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(ws, raw) {
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type !== "message") return;

    const name = String(data.name || "anon").trim().slice(0, MAX_NAME);
    const message = String(data.message || "").trim().slice(0, MAX_MESSAGE);

    if (!message) return;

    const result = this.ctx.storage.sql.exec(
      "INSERT INTO messages (name, message, created_at) VALUES (?, ?, ?)",
      name || "anon",
      message,
      Date.now()
    );

    const id = Number(result.lastRowId);
    const item = { id, name: name || "anon", message };

    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(JSON.stringify({ type: "message", item }));
      } catch {}
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
        return new Response("WebSocket upgrade required", { status: 426 });
      }

      const id = env.CHAT_ROOM.idFromName("main");
      return env.CHAT_ROOM.get(id).fetch(request);
    }

    return env.ASSETS.fetch(request);
  }
};
