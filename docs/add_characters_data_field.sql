-- =============================================================================
-- || ADD CHARACTERS_DATA FIELD TO STORIES TABLE                             ||
-- ||                                                                         ||
-- || This script adds a JSONB field to store the complete array of          ||
-- || characters for stories with multiple characters (1-4).                 ||
-- ||                                                                         ||
-- || Execute this script in your Supabase SQL Editor after the main         ||
-- || migration and preset characters scripts.                               ||
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: ADD CHARACTERS_DATA COLUMN
-- =============================================================================

-- Add the new JSONB column to store complete character array
ALTER TABLE public.stories 
ADD COLUMN characters_data jsonb NULL;

-- Add comment to explain the field
COMMENT ON COLUMN public.stories.characters_data IS 'Complete array of characters used in the story (1-4 characters). Stores full character objects including preset character data.';

-- =============================================================================
-- STEP 2: CREATE INDEX FOR PERFORMANCE  
-- =============================================================================

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_stories_characters_data_gin 
ON public.stories USING GIN (characters_data);




-- =============================================================================
-- || IMPLEMENTATION NOTES                                                    ||
-- =============================================================================

-- USAGE EXAMPLES:
-- 
-- 1. Insert a story with multiple characters:
-- INSERT INTO stories (user_id, title, content, characters_data, character_id, genre, story_format)
-- VALUES (
--     'user-uuid-here',
--     'My Story',
--     'Story content...',
--     '[
--         {"id": "char-1", "name": "Alice", "gender": "female", "description": "Beautiful", "is_preset": false},
--         {"id": "char-2", "name": "Valentina", "gender": "female", "description": "Sultry influencer", "is_preset": true}
--     ]'::jsonb,
--     'char-1',  -- Primary character for compatibility
--     'Romance',
--     'single'
-- );
--
-- 2. Query stories by character name:
-- SELECT * FROM stories 
-- WHERE characters_data @> '[{"name": "Valentina"}]';
--
-- 3. Query stories with preset characters:
-- SELECT * FROM stories 
-- WHERE characters_data @> '[{"is_preset": true}]';
--
-- 4. Count characters in story:
-- SELECT title, jsonb_array_length(characters_data) as character_count
-- FROM stories 
-- WHERE characters_data IS NOT NULL;

COMMIT;

-- =============================================================================
-- || END OF SCRIPT                                                          ||
-- =============================================================================