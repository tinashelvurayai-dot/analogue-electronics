import { cors, json, randCode, randPassword, requireAdmin, synthEmail } from "../_shared/admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { supa } = await requireAdmin(req);
    const { request_id } = await req.json();
    if (!request_id) throw new Error("request_id required");

    const { data: row } = await supa.from("access_requests").select("*").eq("id", request_id).maybeSingle();
    if (!row) throw new Error("Request not found");
    if (row.status === "approved" && row.generated_code) {
      return json({ code: row.generated_code, email: { sent: false, reason: "Send manually via Gmail/WhatsApp" } });
    }

    const { data: settings } = await supa.from("app_settings").select("solo_amount, primary_agent_name").eq("id", true).maybeSingle();
    const synthetic_email = synthEmail();
    const password = randPassword();
    const code = randCode();

    const { data: created, error: createError } = await supa.auth.admin.createUser({
      email: synthetic_email,
      password,
      email_confirm: true,
      user_metadata: { full_name: row.full_name },
    });
    if (createError || !created.user) throw new Error(createError?.message || "Could not create user");

    await supa.from("profiles").upsert({ id: created.user.id, email: synthetic_email, full_name: row.full_name, access_level: "full" });
    await supa.from("access_codes").insert({
      code,
      total_seats: 1,
      used_seats: 1,
      amount: Number(settings?.solo_amount ?? 5),
      agent_name: settings?.primary_agent_name ?? null,
      assigned_emails: [synthetic_email],
      bound_user_id: created.user.id,
      notes: `Auto-issued for request ${row.id}`,
    });
    await supa.from("access_requests").update({
      status: "approved",
      generated_code: code,
      synthetic_email,
      auto_password: password,
      user_id: created.user.id,
      approved_at: new Date().toISOString(),
    }).eq("id", row.id);

    return json({ code, email: { sent: false, reason: "Send manually via Gmail/WhatsApp" } });
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
});