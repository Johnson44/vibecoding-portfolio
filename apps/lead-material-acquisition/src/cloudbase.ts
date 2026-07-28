import type cloudbase from "@cloudbase/js-sdk";
import type { ApiAction, ApiResponse } from "@portfolio/contracts";

export interface CloudbaseConfig {
  apiMode: "demo" | "cloud";
  envId: string;
  functionName: string;
  accessKey: string;
  enabled: boolean;
}

const PLACEHOLDER_ENV_ID = "your-cloudbase-env-id";

export function getCloudbaseConfig(): CloudbaseConfig {
  const env = import.meta.env as Record<string, string | undefined>;
  const apiMode = env.VITE_API_MODE === "cloud" ? "cloud" : "demo";
  const envId = (env.VITE_CLOUDBASE_ENV_ID || "").trim();
  const functionName = (env.VITE_CLOUDBASE_FUNCTION_NAME || "aigc-api").trim();
  const accessKey = (env.VITE_CLOUDBASE_ACCESS_KEY || "").trim();
  const enabled = apiMode === "cloud" && Boolean(envId) && envId !== PLACEHOLDER_ENV_ID && Boolean(functionName) && Boolean(accessKey);
  return { apiMode, envId, functionName, accessKey, enabled };
}

type CloudbaseApp = ReturnType<typeof cloudbase.init>;
let sdk: typeof import("@cloudbase/js-sdk") | undefined;
let app: CloudbaseApp | undefined;

async function loadCloudbaseSdk() {
  const cloudbaseModule = await import("@cloudbase/js-sdk");
  // @cloudbase/js-sdk uses `export = cloudbase`, which Vite exposes as the
  // module's default export when it is loaded dynamically in the browser.
  sdk ??= (cloudbaseModule.default ?? cloudbaseModule) as typeof import("@cloudbase/js-sdk");
  return sdk;
}

export async function callAigcFunction<T>(action: ApiAction, input: unknown): Promise<ApiResponse<T>> {
  const config = getCloudbaseConfig();
  if (!config.enabled) throw new Error("CloudBase未配置：请设置VITE_API_MODE=cloud和VITE_CLOUDBASE_ENV_ID");
  const cloudbaseSdk = await loadCloudbaseSdk();
  const currentApp = app ?? (app = cloudbaseSdk.init({ env: config.envId, accessKey: config.accessKey }));
  const response = await currentApp.callFunction({
    name: config.functionName,
    data: { action, input }
  });
  const result = response.result as ApiResponse<T> | undefined;
  if (!result?.meta) throw new Error("CloudBase返回格式无效");
  if (!result.ok) throw new Error(result.error?.message || "CloudBase请求失败");
  return result;
}
