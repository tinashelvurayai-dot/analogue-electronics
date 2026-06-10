UPDATE public.app_settings SET primary_agent_name = 'Tinashe Lee Vurayai', updated_at = now() WHERE id = true;
UPDATE public.agents SET name = 'Tinashe Lee Vurayai' WHERE name = 'Polite Tafirenyika';
UPDATE public.access_requests SET full_name = 'Tinashe Lee Vurayai' WHERE full_name = 'Polite Tafirenyika';
INSERT INTO public.app_settings (id, primary_agent_name, solo_amount, pair_amount)
VALUES (true, 'Tinashe Lee Vurayai', 5, 8)
ON CONFLICT (id) DO UPDATE SET primary_agent_name = EXCLUDED.primary_agent_name;