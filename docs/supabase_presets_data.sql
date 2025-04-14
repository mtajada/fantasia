-- Datos iniciales para la tabla preset_suggestions
-- Estos son los presets en español que se insertan por defecto

INSERT INTO public.preset_suggestions (text_prompt, language_code, is_active) VALUES
('Que ocurra en un bosque encantado.', 'es', true),
('Ambientar en una ciudad futurista.', 'es', true),
('En lo alto de una montaña nevada.', 'es', true),
<...resto de los presets...>;

-- Este archivo puede ser ejecutado en el SQL Editor de Supabase
-- para poblar la tabla con los presets iniciales
