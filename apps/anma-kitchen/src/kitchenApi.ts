import type { MenuItem } from "./menuData";

type KitchenResource = "orders" | "menu";
type KitchenMethod = "GET" | "POST" | "PUT" | "DELETE";

type KitchenRequest = {
  roomId: string;
  resource: KitchenResource;
  method: KitchenMethod;
  id?: string;
  body?: unknown;
};

type CloudBaseResult<T> = {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
};

let cloudbaseSdk: typeof import("@cloudbase/js-sdk") | undefined;
let cloudbaseApp: ReturnType<typeof import("@cloudbase/js-sdk").init> | undefined;

function useCloudKitchen() {
  return !["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

async function loadCloudBaseSdk() {
  const module = await import("@cloudbase/js-sdk");
  cloudbaseSdk ??= (module.default ?? module) as typeof import("@cloudbase/js-sdk");
  return cloudbaseSdk;
}

async function requestCloudKitchen<T>(request: KitchenRequest) {
  const env = import.meta.env as Record<string, string | undefined>;
  const envId = (env.VITE_CLOUDBASE_ENV_ID || "").trim();
  const functionName = (env.VITE_CLOUDBASE_FUNCTION_NAME || "aigc-api").trim();
  const accessKey = (env.VITE_CLOUDBASE_ACCESS_KEY || "").trim();
  if (!envId || !functionName || !accessKey) throw new Error("CloudBase 配置不完整");

  const sdk = await loadCloudBaseSdk();
  const app = cloudbaseApp ?? (cloudbaseApp = sdk.init({ env: envId, accessKey }));
  const response = await app.callFunction({
    name: functionName,
    data: { action: "kitchen", input: request },
  });
  const result = response.result as CloudBaseResult<T> | undefined;
  if (!result?.ok || result.data === undefined) throw new Error(result?.error?.message || "CloudBase 请求失败");
  return result.data;
}

async function requestLocalKitchen<T>(request: KitchenRequest) {
  const path = `/api/rooms/${encodeURIComponent(request.roomId)}/${request.resource}${request.id ? `/${encodeURIComponent(request.id)}` : ""}`;
  const response = await fetch(path, {
    method: request.method,
    headers: request.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
  });
  if (!response.ok) throw new Error("本地厨房接口请求失败");
  return response.json() as Promise<T>;
}

export function requestKitchen<T>(request: KitchenRequest) {
  return useCloudKitchen() ? requestCloudKitchen<T>(request) : requestLocalKitchen<T>(request);
}

export type { KitchenMethod, KitchenRequest, KitchenResource, MenuItem };
