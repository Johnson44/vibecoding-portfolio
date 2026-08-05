import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type ApiOrder = {
  id: string;
  customer: string;
  note: string;
  items: Array<{ id: string; name: string; category: string; quantity: number }>;
  status: "new" | "cooking" | "ready" | "done";
  createdAt: string;
  updatedAt: string;
};

type ApiMenuItem = { id: string; name: string; category: string; enabled?: boolean };
type RoomRecord = { orders: ApiOrder[]; menu?: ApiMenuItem[] };
type OrderStore = Record<string, RoomRecord>;

const storePath = fileURLToPath(new URL("./.data/orders.json", import.meta.url));
let storePromise: Promise<OrderStore> | null = null;

function normalizeRoomCode(value: string) {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return normalized === "1" || normalized === "2" ? normalized : "";
}

async function loadStore(): Promise<OrderStore> {
  if (!storePromise) {
    storePromise = readFile(storePath, "utf8")
      .then((content) => {
        const parsed = JSON.parse(content) as Record<string, RoomRecord | ApiOrder[]>;
        return Object.fromEntries(Object.entries(parsed).map(([roomId, value]) => [roomId, Array.isArray(value) ? { orders: value } : value])) as OrderStore;
      })
      .catch(() => ({}));
  }
  return storePromise;
}

async function saveStore(store: OrderStore) {
  await mkdir(fileURLToPath(new URL("./.data/", import.meta.url)), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function readJson(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk: Buffer | string) => {
      raw += chunk.toString();
      if (raw.length > 1_000_000) reject(new Error("request too large"));
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("invalid json"));
      }
    });
    request.on("error", reject);
  });
}

function kitchenApi(): Plugin {
  return {
    name: "anma-kitchen-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? "/", "http://anma-kitchen.local");
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments[0] !== "api" || segments[1] !== "rooms") {
          next();
          return;
        }

        const roomId = normalizeRoomCode(segments[2] ?? "");
        const resource = segments[3];
        if (!roomId || !["orders", "menu"].includes(resource ?? "")) {
          sendJson(response, 400, { error: "厨房码无效" });
          return;
        }

        try {
          const store = await loadStore();
          const room = store[roomId] ?? { orders: [] };
          const currentOrders = room.orders;
          const orderId = segments[4];

          if (resource === "menu") {
            if (request.method === "GET") {
              sendJson(response, 200, { menu: room.menu ?? null });
              return;
            }
            if (request.method === "PUT") {
              const incoming = await readJson(request);
              if (!Array.isArray(incoming) || incoming.some((item) => !item?.id || !item?.name || !item?.category)) {
                sendJson(response, 422, { error: "菜单内容不完整" });
                return;
              }
              store[roomId] = { ...room, menu: incoming as ApiMenuItem[] };
              await saveStore(store);
              sendJson(response, 200, { menu: store[roomId].menu });
              return;
            }
            sendJson(response, 405, { error: "不支持的菜单操作" });
            return;
          }

          if (request.method === "GET" && !orderId) {
            sendJson(response, 200, { orders: currentOrders });
            return;
          }

          if (request.method === "POST" && !orderId) {
            const incoming = (await readJson(request)) as ApiOrder;
            if (!incoming?.id || !incoming.customer || !Array.isArray(incoming.items) || !incoming.items.length) {
              sendJson(response, 422, { error: "订单内容不完整" });
              return;
            }
            const nextOrders = [incoming, ...currentOrders.filter((order) => order.id !== incoming.id)];
            store[roomId] = { ...room, orders: nextOrders };
            await saveStore(store);
            sendJson(response, 200, { orders: nextOrders });
            return;
          }

          if (request.method === "PATCH" && orderId) {
            const incoming = (await readJson(request)) as Partial<ApiOrder>;
            const nextOrders = currentOrders.map((order) => order.id === orderId ? { ...order, ...incoming, id: order.id, updatedAt: new Date().toISOString() } : order);
            store[roomId] = { ...room, orders: nextOrders };
            await saveStore(store);
            sendJson(response, 200, { orders: nextOrders });
            return;
          }

          if (request.method === "DELETE" && !orderId) {
            store[roomId] = { ...room, orders: [] };
            await saveStore(store);
            sendJson(response, 200, { orders: [] });
            return;
          }

          if (request.method === "DELETE" && orderId) {
            const nextOrders = currentOrders.filter((order) => order.id !== orderId);
            store[roomId] = { ...room, orders: nextOrders };
            await saveStore(store);
            sendJson(response, 200, { orders: nextOrders });
            return;
          }

          sendJson(response, 405, { error: "不支持的订单操作" });
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : "厨房服务暂时不可用" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), kitchenApi()],
  base: "./",
  server: { host: "0.0.0.0", port: 5178 },
  build: { outDir: "dist" },
});
