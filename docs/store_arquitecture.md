# Store Architecture and Data Flow Guide (Zustand + Supabase)

**Document Version:** 1.0
**Date:** 2023-10-27 (Update with actual date)
**Target Audience:** Code Agent (e.g., Windsurf), Developers

## 1. Overview

This document details the state management architecture for the AI Storyteller web application, primarily located within the `src/store` directory. The application utilizes **Zustand** as its state management library, employing a modular approach where different aspects of the application state are handled by separate "stores."

**Key Goals of this Architecture:**

*   **Centralized State:** Provide a single source of truth for various application states.
*   **Modularity:** Separate concerns into logical units (user, characters, stories, etc.) for maintainability.
*   **Reactivity:** Enable UI components to react automatically to state changes.
*   **Persistence:** Persist user-specific state across browser sessions using `localStorage`.
*   **Supabase Integration:** Manage the flow of data between the frontend state and the Supabase backend (database and authentication).
*   **Multi-User Support:** Isolate the persisted state for different authenticated users.

## 2. Core Concepts & Mechanisms

Several core mechanisms underpin how the stores function:

### 2.1. Persistent Store Creation (`@store/core/createStore.ts`)

*   **`createPersistentStore<T>(initialState, storeLogic, storeName)`:** A custom wrapper around Zustand's `create` and `persist` middleware.
*   **User-Specific Persistence:**
    *   It automatically generates a unique `localStorage` key for each store *and* each authenticated user: `` `story-app-${userId}-${storeName}` `` (e.g., `story-app-user123-characters`). `userId` is 'anonymous' if no user is logged in.
    *   This ensures that data from different users does not mix in `localStorage`.
*   **`setCurrentAuthUser(userId: string | null)`:** **Crucial function.** Called by `@store/user/userStore.ts` during login/logout/auth check. It updates a global tracker for the current user ID, which `createPersistentStore` uses to generate the correct storage key.
*   **`cleanPreviousUserStores(currentUserId: string)`:** Called when the user changes (via `setCurrentAuthUser`). It iterates through `localStorage` and removes keys associated with *previous* users (keys matching `story-app-...` but *not* containing the `currentUserId` and not being the generic `story-app-user` key).
*   **`registerStoreRefresh(storeName: string, refreshFn: Function)` & `refreshAllStores()`:** A mechanism allowing stores to register a function (typically their `load...FromSupabase` method) that gets called automatically by `refreshAllStores` (triggered via `setCurrentAuthUser` on user change) to reload data relevant to the *new* user.

### 2.2. Data Loading & Synchronization Flow

The loading of user-specific data from Supabase upon login or app initialization follows a specific, centralized pattern orchestrated by `@store/user/userStore.ts`:

1.  **Initiation:** Triggered by:
    *   App load (`@main.ts` -> `@services/syncService.ts` -> `useUserStore.checkAuth()`).
    *   Explicit Login (`Login Page` -> `supabaseAuth.login` -> `useUserStore.loginUser()`).
    *   Coming back online (`online` event -> `@services/syncService.ts` -> `useUserStore.checkAuth()`).
2.  **`userStore.checkAuth()` / `userStore.loginUser()`:**
    *   Verifies authentication state with Supabase Auth (`supabase.auth.getSession`, `supabase.auth.getUser`).
    *   If authenticated, calls `setCurrentAuthUser(userId)` to set the global user ID.
    *   Calls `@services/supabase.ts -> getUserProfile(userId)` to fetch the user's *complete* profile data (including settings, subscription status, limits, credits).
    *   Updates its *own* state (`user` and `profileSettings`).
    *   **Crucially, calls the internal `syncAllUserData(userId)` function.**
3.  **`userStore.syncAllUserData(userId)`:**
    *   This function acts as the **central orchestrator** for loading data into *other* stores.
    *   It iterates through a predefined list (`otherStores`) of stores and their respective data-loading methods (e.g., `useCharacterStore.loadCharactersFromSupabase`, `useStoriesStore.loadStoriesFromSupabase`, `useAudioStore.loadAudioFromSupabase`).
    *   It calls these methods sequentially, passing the `userId`.
4.  **Individual Store `load...FromSupabase(userId)` Methods:**
    *   Each store's loading method (e.g., `@store/character/characterStore.ts -> loadCharactersFromSupabase`) uses the provided `userId` to call the relevant data-fetching function in `@services/supabase.ts` (e.g., `getUserCharacters`).
    *   **Important:** These methods should **first clear** the relevant part of their local state (e.g., `set({ savedCharacters: [] })`) before fetching and setting the fresh data from Supabase to prevent merging old/stale data.
    *   They update their own state upon successful data retrieval.

### 2.3. Offline Queue (`@services/supabase.ts -> syncQueue`)

*   **Purpose:** To handle situations where the application is offline or a direct Supabase operation fails temporarily.
*   **Mechanism:**
    *   When a direct Supabase write operation (e.g., `syncCharacter`, `syncUserProfile`) fails within its `try...catch` block, the operation details (table, operation type, data) are added to the `syncQueue` using `syncQueue.addToQueue(...)`.
    *   The `SyncQueueService` class persists this queue in `localStorage`.
    *   An `online` event listener triggers `syncQueue.processQueue()`.
    *   `processQueue()` attempts to execute the queued operations (using `upsert` for resilience) against Supabase. Successful operations are removed from the queue; failed ones are re-queued.
*   **Consideration:** Requires careful handling of data format, especially ensuring `id` is present for `delete` operations.

## 3. Store Breakdown

### 3.1. `@store/user/userStore.ts`

*   **Purpose:** Manages user authentication state, user profile settings (including subscription/limit data), and orchestrates the initial data loading for other stores.
*   **Key State:**
    *   `user: User | null`: Basic user info (id, email).
    *   `profileSettings: ProfileSettings | null`: Complete profile data fetched from the `profiles` table (language, age, special need, subscription status, credits, limits, etc.). **Crucial for app logic.**
*   **Key Actions:**
    *   `checkAuth()`: Verifies auth, loads profile, triggers `syncAllUserData`. **Central function.**
    *   `loginUser(user)`: Sets user state, loads profile, triggers `syncAllUserData`.
    *   `logoutUser()`: Processes sync queue, signs out via `@services/supabaseAuth.logout`, clears local state, calls `setCurrentAuthUser(null)`.
    *   `setProfileSettings(settings)`: Updates `profileSettings` state locally, calls `@services/supabase.syncUserProfile` to persist *editable* settings (language, age, need), and uses `syncQueue` on failure. **Important:** This should *not* attempt to modify non-editable fields like subscription status.
*   **Supabase Interaction:** Calls `getCurrentUser`, `logout`, `getUserProfile`, `syncUserProfile`, `syncQueue`.
*   **Notes:** Contains the vital `syncAllUserData` orchestrator function. Ensure all necessary stores are listed in its `otherStores` array.

### 3.2. `@store/character/characterStore.ts`

*   **Purpose:** Manages user-created characters.
*   **Key State:**
    *   `currentCharacter: StoryCharacter | null`: The character currently being edited or selected.
    *   `savedCharacters: StoryCharacter[]`: List of all characters saved by the user.
*   **Key Actions:**
    *   `updateCharacter(updates)`: Modifies `currentCharacter`.
    *   `resetCharacter()`: Clears `currentCharacter` for creating a new one.
    *   `saveCurrentCharacter()`: Adds/updates `currentCharacter` in `savedCharacters`, calls `@services/supabase.syncCharacter`, uses `syncQueue` on failure. Handles local duplicate name check.
    *   `selectCharacter(characterId)`: Sets `currentCharacter` from `savedCharacters`.
    *   `deleteCharacter(characterId)`: Removes character locally, calls `@services/supabase.deleteCharacter`, uses `syncQueue` on failure.
    *   `loadCharactersFromSupabase(userId)`: Clears `savedCharacters`, fetches via `@services/supabase.getUserCharacters`, updates state. Called by `syncAllUserData`.
*   **Supabase Interaction:** Calls `syncCharacter`, `getUserCharacters`, `deleteCharacter`, `syncQueue`.
*   **Notes:** The previous `setTimeout` for initial load was removed; relies solely on `syncAllUserData`.

### 3.3. `@store/stories/storiesStore.ts`

*   **Purpose:** Manages the list of generated stories (metadata and initial content).
*   **Key State:**
    *   `generatedStories: Story[]`: List of stories created by the user.
    *   `isGeneratingStory: boolean`: Flag for UI loading state during story generation.
*   **Key Actions:**
    *   `addGeneratedStory(story)`: Adds a new story locally, calls `@services/supabase.syncStory`, uses `syncQueue` on failure.
    *   `getStoryById(id)`: Retrieves a specific story from the local state.
    *   `loadStoriesFromSupabase(userId)`: Clears `generatedStories`, fetches via `@services/supabase.getUserStories`, updates state. Called by `syncAllUserData`.
*   **Supabase Interaction:** Calls `syncStory`, `getUserStories`, `syncQueue`.

### 3.4. `@store/stories/chapters/chaptersStore.ts`

*   **Purpose:** Manages the individual chapters associated with each story.
*   **Key State:**
    *   `storyChapters: StoryWithChapters[]`: An array where each element represents a story and contains an array of its `chapters`. (Note: This duplicates some story metadata; consider if just storing chapters grouped by `storyId` is sufficient).
*   **Key Actions:**
    *   `addChapter(storyId, chapter)`: Adds a new chapter to the appropriate story in `storyChapters`, calls `@services/supabase.syncChapter`, uses `syncQueue` on failure.
    *   `getChaptersByStoryId(storyId)`: Retrieves chapters for a specific story.
    *   `loadChaptersFromSupabase(storyId)`: Fetches chapters for a *specific story* via `@services/supabase.getStoryChapters`. This is typically called on demand when viewing a story, *not* by `syncAllUserData` initially.
*   **Supabase Interaction:** Calls `syncChapter`, `getStoryChapters`, `syncQueue`.

### 3.5. `@store/stories/audio/audioStore.ts`

*   **Purpose:** Manages generated audio files, generation status, and user voice preference.
*   **Key State:**
    *   `audioCache: { [key: string]: { url: string; timestamp: string } }`: Cache of generated audio URLs.
    *   `generationStatus: { [key: string]: { status: string; progress: number } }`: Tracks audio generation progress.
    *   `currentVoice: string | null`: The ID of the user's preferred voice.
*   **Key Actions:**
    *   `addAudioToCache(...)`: Adds audio URL locally, calls `@services/supabase.syncAudioFile`, uses `syncQueue` on failure.
    *   `setCurrentVoice(voiceId)`: Updates state, calls `@services/supabase.setCurrentVoice`.
    *   `loadAudioFromSupabase(userId)`: Fetches *existing* generated audio records and the user's current voice preference via `@services/supabase.getUserAudios` and `@services/supabase.getCurrentVoice`. Called by `syncAllUserData`.
*   **Supabase Interaction:** Calls `syncAudioFile`, `getUserAudios`, `setCurrentVoice`, `getCurrentVoice`, `syncQueue`.

### 3.6. `@store/stories/challenges/challengesStore.ts`

*   **Purpose:** Manages challenges and questions associated with stories.
*   **Key State:**
    *   `challenges: Challenge[]`: List of all challenges across stories.
*   **Key Actions:**
    *   `addChallenge(challenge)`: Adds challenge locally, calls `@services/supabase.syncChallenge` (which handles challenge and questions), uses `syncQueue` on failure.
    *   `getChallengesByStoryId(storyId)`: Filters challenges for a specific story.
    *   `loadChallengesFromSupabase(storyId)`: Fetches challenges for a *specific story* via `@services/supabase.getStoryChallenges`. Called on demand.
*   **Supabase Interaction:** Calls `syncChallenge`, `getStoryChallenges`, `syncQueue`.

### 3.7. `@store/storyOptions/storyOptionsStore.ts`

*   **Purpose:** Temporarily stores user selections while configuring a *new* story (duration, moral, genre).
*   **Key State:**
    *   `currentStoryOptions: Partial<StoryOptions>`: Holds the options being built.
*   **Key Actions:** `updateStoryOptions`, `resetStoryOptions`, specific setters (`setDuration`, etc.).
*   **Supabase Interaction:** None directly. This is purely transient frontend state, persisted locally for convenience during configuration.

## 4. Supabase Interaction Layer

*   **`@services/supabaseClient.ts`:** **Single source of truth.** Initializes and exports the `supabase` client instance. All other files needing the client *must* import it from here.
*   **`@services/supabaseAuth.ts`:** Handles **authentication** operations ONLY (`signUp`, `login`, `logout`, `signInWithGoogle`, `getCurrentUser`, `requestPasswordReset`). It imports and uses the client from `@supabaseClient.ts`. It *does not* handle profile data or manual state tracking anymore.
*   **`@services/supabase.ts`:** Handles **database operations** ONLY (CRUD for profiles, characters, stories, chapters, audio, challenges, voices). It imports and uses the client from `@supabaseClient.ts`. Relies heavily on Supabase RLS for security and data access control.
*   **Reliance on RLS:** Security and data access rules (e.g., "user can only see their own stories", "user can only insert profile if ID matches auth ID") are primarily enforced by **Row Level Security (RLS) policies** defined directly in the Supabase database, *not* by client-side checks (which were removed).

## 5. Context within the Application

*   **Initialization (`@main.ts`):** The entry point initializes the core app (`AppWithAuth`). `AppWithAuth` uses a `useEffect` hook to call `useUserStore.checkAuth()` on mount. After `checkAuth` completes, it calls `@services/syncService.initSyncService()`.
*   **Sync Service (`@services/syncService.ts`):**
    *   `initSyncService`: Called once by `main.ts`. Sets up listeners. Tries an initial sync.
    *   `initSyncListeners`: Listens for `online` and `visibilitychange` events.
    *   `syncUserData`: **Initiator function.** Called on initial load (if online) and by listeners. It verifies connection/session and then triggers the main loading flow by calling `useUserStore.checkAuth()`. **It no longer loads data directly.**
*   **UI Components (`@components/`, `@pages/`):**
    *   Interact with the state using Zustand hooks (e.g., `const { user, profileSettings } = useUserStore();`, `const { savedCharacters, saveCurrentCharacter } = useCharacterStore();`).
    *   Subscribe to state changes and re-render automatically.
    *   Call action functions from the stores (e.g., `saveCurrentCharacter()`, `setProfileSettings(...)`, `addGeneratedStory(...)`) to modify state and trigger backend synchronization.
    *   Use selectors/state data (e.g., `profileSettings.subscription_status`, `profileSettings.voice_credits`) for **Feature Gating**: enabling/disabling buttons, showing/hiding options, displaying limits based on the user's plan.

## 6. Common Issues & Pitfalls Encountered/Resolved

*   **RLS Policies:**
    *   **Missing `INSERT` Policy:** Forgetting to define an `INSERT` policy (e.g., for `profiles`) prevents record creation even if the user is authenticated. Solution: Add `CREATE POLICY ... FOR INSERT ... WITH CHECK (auth.uid() = id);`.
    *   **Incorrect Conditions:** Ensure `USING` (for SELECT/UPDATE/DELETE) and `WITH CHECK` (for INSERT/UPDATE) conditions correctly use `auth.uid()` and match the appropriate columns (`id` or `user_id`).
*   **Type Mismatches:**
    *   **`ProfileSettings`:** The type definition in `@types.ts` *must* accurately reflect *all* columns fetched from the `profiles` table by `getUserProfile`, including Stripe/limit fields. Failure leads to TS errors and missing data in the store.
    *   **DB Column Names:** Trying to insert/update a column name (e.g., `age_range`) in Supabase functions (`syncUserProfile`, `syncQueue.addToQueue`) or SQL Functions (`HandleNewUser`) that doesn't exist in the actual DB table causes runtime errors. Solution: Ensure code uses exact DB column names.
*   **Redundant Data Loading:**
    *   Avoid calling individual `load...FromSupabase` methods directly after `checkAuth` if `syncAllUserData` already handles it (e.g., removed in `syncService.ts`).
    *   Avoid using `setTimeout` for initial data loading in stores (e.g., removed in `characterStore.ts`). Rely on the `checkAuth` -> `syncAllUserData` flow.
*   **Supabase Client Initialization:**
    *   Having multiple `createClient` calls leads to confusion and potential errors. Solution: Centralize client creation in `@supabaseClient.ts` and import it everywhere else. Ensure all `import { supabase }` statements point to this single file.
*   **Timing Issues:**
    *   **Post-`signUp` Profile Creation:** Calling profile creation (`syncUserProfile`) *immediately* after `signUp` might fail due to RLS not recognizing the new `auth.uid()` yet. Solution: Integrate profile creation into the standard `checkAuth` / `loginUser` flow, which ensures the session is fully established, or add a small delay/retry if absolutely necessary.
*   **Forgetting Store Orchestration:**
    *   When adding a new store that needs initial data loading, remember to add it to the `otherStores` array within the `syncAllUserData` function in `@userStore.ts`.
*   **Offline Queue (`syncQueue`):**
    *   Ensure data passed to `addToQueue` for `delete` operations contains the necessary `id`.
    *   Stale/incorrect items stuck in `localStorage` can cause repeated errors. Solution: Clear the `sync_queue` key in `localStorage` during debugging if necessary.
*   **SQL Function Security:**
    *   Functions modifying sensitive data or called from untrusted contexts (like webhooks) should generally use `SECURITY DEFINER` (e.g., `increment_voice_credits`). Ensure appropriate `GRANT EXECUTE` permissions are set for the calling role (e.g., `service_role`). Trigger functions often use `INVOKER` or `DEFINER` depending on needs (`handle_new_user` needs `DEFINER`).

## 7. Conclusion

This modular Zustand architecture, coupled with a well-defined data synchronization flow orchestrated by `userStore` and reliant on Supabase RLS, provides a robust foundation for the application. Maintaining consistency in Supabase client usage, type definitions, and the central data loading pattern is key to stability. Understanding the interaction between frontend stores, the Supabase service layer, and RLS policies is crucial for debugging and future development. Remember to manage SQL functions via Supabase Migrations for proper version control.