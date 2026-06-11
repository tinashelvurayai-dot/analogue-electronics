import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

export async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Unauthorized");
  const supa = adminClient();
  const { data: userRes, error } = await supa.auth.getUser(token);
  if (error || !userRes?.user) throw new Error("Unauthorized");
  const { data: roles } = await supa.from("user_roles").select("role").eq("user_id", userRes.user.id);
  if (!roles?.some((r: { role: string }) => r.role === "admin")) throw new Error("Forbidden");
  return { supa, userId: userRes.user.id };
}

export function randCode() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUT-${seg()}-${seg()}`;
}

export function randPassword() {
  return `${crypto.randomUUID()}Aa1!`;
}

export function synthEmail() {
  return `access-${crypto.randomUUID()}@analogue-electronics.local`;
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
}