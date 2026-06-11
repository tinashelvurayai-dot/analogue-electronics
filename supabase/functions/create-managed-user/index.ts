import { cors, json, requireAdmin } from "../_shared/admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { supa } = await requireAdmin(req);
    const { email, password, full_name, access_level } = await req.json();
    if (!email || !String(email).includes("@")) throw new Error("Valid email required");
    if (!password || String(password).length < 6) throw new Error("Password must be at least 6 characters");

    const cleanEmail = String(email).trim().toLowerCase();
    const { data: created, error } = await supa.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: { full_name: full_name || cleanEmail },
    });
    if (error || !created.user) throw new Error(error?.message || "Could not create user");
    await supa.from("profiles").upsert({
      id: created.user.id,
      email: cleanEmail,
      full_name: full_name || cleanEmail,
      access_level: access_level === "free" ? "free" : "full",
    });
    return json({ ok: true, user_id: created.user.id });
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
});