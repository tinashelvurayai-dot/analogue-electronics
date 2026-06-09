import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const clean = (value: string) => value.trim();
const randCode = () => `AUT-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const randPassword = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
const synthEmail = () => `access-${crypto.randomUUID()}@power-study-buddy.local`;

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(userId: string) {
  const supabaseAdmin = await getAdminClient();
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
  return supabaseAdmin;
}

const submitAccessRequest = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ full_name: z.string().min(2).max(120), whatsapp: z.string().min(5).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const supabaseAdmin = await getAdminClient();
    const { error } = await supabaseAdmin.from("access_requests").insert({ full_name: clean(data.full_name), whatsapp: clean(data.whatsapp), status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const signInWithAccessCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ full_name: z.string().min(2).max(120), code: z.string().min(6).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const supabaseAdmin = await getAdminClient();
    const { data: row } = await supabaseAdmin.from("access_requests").select("*").eq("generated_code", clean(data.code).toUpperCase()).eq("status", "approved").maybeSingle();
    if (!row?.synthetic_email || !row?.auto_password || clean(row.full_name).toLowerCase() !== clean(data.full_name).toLowerCase()) throw new Error("Invalid name or access code");
    return { email: row.synthetic_email as string, password: row.auto_password as string };
  });

const approveAccessRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ request_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);
    const { data: row } = await supabaseAdmin.from("access_requests").select("*").eq("id", data.request_id).maybeSingle();
    if (!row) throw new Error("Request not found");
    if (row.status === "approved" && row.generated_code) return { code: row.generated_code as string, email: { sent: false, reason: "Send manually via Gmail/WhatsApp" } };
    const synthetic_email = synthEmail();
    const password = randPassword();
    const code = randCode();
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({ email: synthetic_email, password, email_confirm: true, user_metadata: { full_name: row.full_name } });
    if (createError || !created.user) throw new Error(createError?.message || "Could not create user");
    await supabaseAdmin.from("profiles").upsert({ id: created.user.id, email: synthetic_email, full_name: row.full_name, access_level: "full" });
    await supabaseAdmin.from("access_codes").insert({ code, total_seats: 1, used_seats: 1, amount: 5, assigned_emails: [synthetic_email], bound_user_id: created.user.id, notes: `Auto-issued for request ${row.id}` });
    await supabaseAdmin.from("access_requests").update({ status: "approved", generated_code: code, synthetic_email, auto_password: password, user_id: created.user.id, approved_at: new Date().toISOString() }).eq("id", row.id);
    return { code, email: { sent: false, reason: "Send manually via Gmail/WhatsApp" } };
  });

const rejectAccessRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ request_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("access_requests").update({ status: "rejected" }).eq("id", data.request_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const createManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ email: z.string().email(), password: z.string().min(6), full_name: z.string().optional(), access_level: z.enum(["free", "full"]).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email: clean(data.email), password: data.password, email_confirm: true, user_metadata: { full_name: data.full_name || data.email } });
    if (error || !created.user) throw new Error(error?.message || "Could not create user");
    await supabaseAdmin.from("profiles").upsert({ id: created.user.id, email: clean(data.email), full_name: data.full_name || data.email, access_level: data.access_level === "free" ? "free" : "full" });
    return { ok: true as const, user_id: created.user.id };
  });

const adminExistsFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = await getAdminClient();
  const { data } = await supabaseAdmin.from("user_roles").select("id").eq("role", "admin").limit(1);
  return { exists: !!data?.length };
});

const claimAdminFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await getAdminClient();
    const { data: existing } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin").limit(1);
    if (existing?.length && existing[0].user_id !== context.userId) return { success: false, error: "Admin already exists" };
    await supabaseAdmin.from("user_roles").upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    return { success: true };
  });

const redeemAccessCodeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().min(6).max(40) }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getAdminClient();
    const code = clean(data.code).toUpperCase();
    const { data: c } = await supabaseAdmin.from("access_codes").select("*").eq("code", code).maybeSingle();
    if (!c) return { success: false, error: "Invalid code" };
    if (c.used_seats >= c.total_seats) return { success: false, error: "Code has no seats left" };
    await supabaseAdmin.from("access_code_usage").insert({ code_id: c.id, user_id: context.userId });
    await supabaseAdmin.from("access_codes").update({ used_seats: c.used_seats + 1 }).eq("id", c.id);
    await supabaseAdmin.from("profiles").update({ access_level: "full", updated_at: new Date().toISOString() }).eq("id", context.userId);
    return { success: true };
  });

export const accessApi = {
  submit: (input: { full_name: string; whatsapp: string }) => submitAccessRequest({ data: input }),
  signIn: (input: { full_name: string; code: string }) => signInWithAccessCode({ data: input }),
  approve: (input: { request_id: string }) => approveAccessRequest({ data: input }),
  reject: (input: { request_id: string }) => rejectAccessRequest({ data: input }),
  resend: async () => ({ email: { sent: false, reason: "Send manually via Gmail/WhatsApp" } }),
  createUser: (input: { email: string; password: string; full_name?: string; access_level?: "free" | "full" }) => createManagedUser({ data: input }),
  adminExists: () => adminExistsFn(),
  claimAdmin: () => claimAdminFn(),
  redeem: (input: { code: string }) => redeemAccessCodeFn({ data: input }),
};