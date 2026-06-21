import { supabase } from "@/integrations/supabase/client";

const clean = (value: string) => value.trim();

async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw new Error(error.message || `${name} failed`);
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error?: unknown }).error || `${name} failed`));
  }
  return data as T;
}

export const accessApi = {
  submit: async (input: { full_name: string; whatsapp: string; email?: string }) => {
    const { error } = await supabase.from("access_requests").insert({
      full_name: clean(input.full_name),
      whatsapp: clean(input.whatsapp),
      email: input.email ? clean(input.email) : null,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },
  signIn: (input: { full_name: string; code: string }) => callFunction<{ email: string; password: string }>("access-signin", input),
  approve: (input: { request_id: string }) => callFunction<{ code: string; email: { sent: false; reason: string } }>("access-approve", input),
  reject: (input: { request_id: string }) => callFunction<{ ok: true }>("access-reject", input),
  resend: async () => ({ email: { sent: false, reason: "Send manually via Gmail/WhatsApp" } }),
  createUser: (input: { email: string; password: string; full_name?: string; access_level?: "free" | "full" }) => callFunction<{ ok: true; user_id: string }>("create-managed-user", input),
  adminExists: async () => {
    const { data, error } = await supabase.rpc("admin_exists");
    if (error) throw new Error(error.message);
    return { exists: !!data };
  },
  claimAdmin: async () => {
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) throw new Error(error.message);
    return data as { success: boolean; error?: string };
  },
  redeem: async (input: { code: string }) => {
    const { data, error } = await supabase.rpc("redeem_access_code", { _code: clean(input.code).toUpperCase() });
    if (error) throw new Error(error.message);
    return data as { success: boolean; error?: string };
  },
};