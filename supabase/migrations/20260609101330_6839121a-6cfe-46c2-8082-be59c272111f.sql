REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_access_code(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redeem_access_code(text) TO authenticated, service_role;