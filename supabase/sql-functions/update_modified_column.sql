CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;