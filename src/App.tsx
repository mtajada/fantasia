import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AuthGuard from "./components/AuthGuard";

// Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import CharacterSelection from "./pages/CharacterSelection";
import CharacterName from "./pages/CharacterName";
import CharacterHobbies from "./pages/CharacterHobbies";
import CharacterPersonality from "./pages/CharacterPersonality";
import CharacterType from "./pages/CharacterType";
import CharacterProfession from "./pages/CharacterProfession";
import DurationSelection from "./pages/DurationSelection";
import StoryGenre from "./pages/StoryGenre";
import StoryMoral from "./pages/StoryMoral";
import GeneratingStory from "./pages/GeneratingStory";
import StoryViewer from "./pages/StoryViewer";
import StoryAudioPage from "./pages/StoryAudioPage";
import StoryContinuation from "./pages/StoryContinuation";
import SavedStories from "./pages/SavedStories";
import ErrorPage from "./pages/ErrorPage";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import CharactersManagement from "./pages/CharactersManagement";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Payment routes */}
              <Route path="/payment-success" element={<AuthGuard><PaymentSuccess /></AuthGuard>} />
              <Route path="/payment-cancel" element={<AuthGuard><PaymentCancel /></AuthGuard>} />
              
              {/* Protected routes */}
              <Route path="/profile" element={<AuthGuard><ProfileSetup /></AuthGuard>} />
              <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
              <Route path="/duration" element={<AuthGuard><DurationSelection /></AuthGuard>} />
              <Route path="/characters-management" element={<AuthGuard><CharactersManagement /></AuthGuard>} />
              <Route path="/character-selection" element={<AuthGuard><CharacterSelection /></AuthGuard>} />
              <Route path="/character-name" element={<AuthGuard><CharacterName /></AuthGuard>} />
              <Route path="/character-hobbies" element={<AuthGuard><CharacterHobbies /></AuthGuard>} />
              <Route path="/character-personality" element={<AuthGuard><CharacterPersonality /></AuthGuard>} />
              <Route path="/character-type" element={<AuthGuard><CharacterType /></AuthGuard>} />
              <Route path="/character-profession" element={<AuthGuard><CharacterProfession /></AuthGuard>} />
              <Route path="/story-genre" element={<AuthGuard><StoryGenre /></AuthGuard>} />
              <Route path="/story-moral" element={<AuthGuard><StoryMoral /></AuthGuard>} />
              <Route path="/generating" element={<AuthGuard><GeneratingStory /></AuthGuard>} />
              <Route path="/story/:storyId" element={<AuthGuard><StoryViewer /></AuthGuard>} />
              <Route path="/story/:storyId/audio/:chapterId?" element={<AuthGuard><StoryAudioPage /></AuthGuard>} />
              <Route path="/story/:storyId/continue" element={<AuthGuard><StoryContinuation /></AuthGuard>} />
              <Route path="/stories" element={<AuthGuard><SavedStories /></AuthGuard>} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
