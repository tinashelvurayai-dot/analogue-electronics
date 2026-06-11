import { cors, json, requireAdmin } from "../_shared/admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { supa } = await requireAdmin(req);
    const { request_id } = await req.json();
    if (!request_id) throw new Error("request_id required");
    const { error } = await supa.from("access_requests").update({ status: "rejected" }).eq("id", request_id);
    if (error) throw new Error(error.message);
    return json({ ok: true });
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
});