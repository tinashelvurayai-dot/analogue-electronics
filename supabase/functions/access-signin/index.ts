import { adminClient, cors, json } from "../_shared/admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { full_name, code } = await req.json();
    if (!full_name || !code) throw new Error("Full name and code required");
    const supa = adminClient();
    const { data: row } = await supa
      .from("access_requests")
      .select("*")
      .eq("generated_code", String(code).trim().toUpperCase())
      .eq("status", "approved")
      .maybeSingle();
    if (!row?.synthetic_email || !row?.auto_password) throw new Error("Invalid name or access code");
    if (String(row.full_name).trim().toLowerCase() !== String(full_name).trim().toLowerCase()) throw new Error("Invalid name or access code");
    return json({ email: row.synthetic_email, password: row.auto_password });
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
});