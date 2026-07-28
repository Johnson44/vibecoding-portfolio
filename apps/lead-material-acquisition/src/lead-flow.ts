export type LeadRequest = { phone: string; consent: boolean; source: string };

export function validateLeadSubmission(phone: string, consent: boolean): { ok: true } | { ok: false; message: string } {
  if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, message: "请输入正确的 11 位手机号" };
  if (!consent) return { ok: false, message: "请先阅读并同意隐私说明" };
  return { ok: true };
}

export function buildLeadRequest(phone: string, source = "direct"): LeadRequest {
  return { phone, consent: true, source };
}
