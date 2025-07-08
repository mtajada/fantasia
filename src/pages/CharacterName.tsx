import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, AlertCircle, Users, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/supabaseClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { StoryCharacter } from "@/types";
import BackButton from "../components/BackButton";
import PageTransition from "../components/PageTransition";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Define a type for the window with the nameTimeout property
declare global {
  interface Window {
    nameTimeout: NodeJS.Timeout | undefined;
  }
}

export default function CharacterName() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Obtener los parámetros de la URL
  const searchParams = new URLSearchParams(location.search);
  const fromManagement = searchParams.get('from') === 'management';
  const actionCreate = searchParams.get('action') === 'create';
  const editCharacterId = searchParams.get('edit');
  
  // Estado para el personaje y validaciones
  const [character, setCharacter] = useState({
    name: '',
    gender: 'male' as const,
    description: ''
  });
  const [editingCharacter, setEditingCharacter] = useState<StoryCharacter | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<StoryCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isFocused, setIsFocused] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Cargar personajes guardados
        const { data: characters } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id);
        
        setSavedCharacters(characters || []);

        // Si estamos editando, cargar datos del personaje
        if (editCharacterId) {
          const editChar = characters?.find(char => char.id === editCharacterId);
          if (editChar) {
            setEditingCharacter(editChar);
            setCharacter({
              name: editChar.name,
              gender: editChar.gender,
              description: editChar.description
            });
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Error cargando datos');
      }
    };

    loadInitialData();
  }, [editCharacterId, navigate]);

  // Validar formulario
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!character.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (character.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (checkNameExists(character.name)) {
      newErrors.name = `You already have a character named "${character.name}"`;
    }
    
    if (!character.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (character.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si el nombre ya existe
  const checkNameExists = (nameToCheck: string): boolean => {
    if (!nameToCheck.trim()) return false;
    
    return savedCharacters.some(
      char => char.name.toLowerCase() === nameToCheck.toLowerCase() && 
              char.id !== editingCharacter?.id
    );
  };
  
  // Manejar guardado del personaje
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Verificar conexión de red
      if (!navigator.onLine) {
        toast.error('No internet connection', {
          description: 'Check your connection and try again'
        });
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Session expired', {
          description: 'Please log in again'
        });
        navigate('/login');
        return;
      }

      let result;
      if (editingCharacter) {
        // Verificar que el personaje aún existe y pertenece al usuario
        const { data: existingChar } = await supabase
          .from('characters')
          .select('user_id')
          .eq('id', editingCharacter.id)
          .single();
        
        if (!existingChar) {
          toast.error('Character not found', {
            description: 'The character may have been deleted'
          });
          navigate('/characters-management');
          return;
        }
        
        if (existingChar.user_id !== user.id) {
          toast.error('No permissions', {
            description: 'You cannot edit this character'
          });
          navigate('/characters-management');
          return;
        }

        // Actualizar personaje existente
        result = await supabase
          .from('characters')
          .update({
            name: character.name,
            gender: character.gender,
            description: character.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCharacter.id)
          .select()
          .single();
      } else {
        // Crear nuevo personaje
        result = await supabase
          .from('characters')
          .insert({
            user_id: user.id,
            name: character.name,
            gender: character.gender,
            description: character.description
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        
        // Manejar errores específicos
        if (result.error.code === '23505') {
          toast.error('Nombre duplicado', {
            description: 'Ya tienes un personaje con ese nombre'
          });
          setErrors({ name: 'Ya tienes un personaje con ese nombre' });
          return;
        }
        
        throw result.error;
      }

      toast.success(editingCharacter ? "¡Personaje actualizado!" : "¡Personaje creado!", {
        duration: 1500,
        description: "Continuando a la selección de género..."
      });

      // Navegar a la selección de género
      setTimeout(() => {
        const params = new URLSearchParams();
        if (fromManagement) params.set('from', 'management');
        if (actionCreate) params.set('action', 'create');
        if (editCharacterId) params.set('edit', editCharacterId);
        navigate(`/story-genre${params.toString() ? '?' + params.toString() : ''}`);
      }, 1000);

    } catch (error: any) {
      console.error('Error saving character:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message?.includes('network')) {
        toast.error('Error de conexión', {
          description: 'Verifica tu conexión a internet'
        });
      } else if (error.message?.includes('timeout')) {
        toast.error('Tiempo de espera agotado', {
          description: 'El servidor tardó demasiado en responder'
        });
      } else {
        toast.error('Error guardando personaje', {
          description: 'Intenta nuevamente o contacta soporte'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };
  
  // Manejar cambios en los campos
  const handleFieldChange = (field: keyof typeof character, value: string) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Validación en tiempo real para el nombre
    if (field === 'name' && value.trim()) {
      if (checkNameExists(value)) {
        setErrors(prev => ({ ...prev, name: `You already have a character named "${value}"` }));
      }
    }
    
    if (!hasTyped && value.length > 0) {
      setHasTyped(true);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };
  
  // Efecto para limpiar timeouts
  useEffect(() => {
    return () => {
      clearTimeout(window.nameTimeout);
    };
  }, []);

  // Efecto para manejar el estado online/offline
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      if (!navigator.onLine) {
        toast.error('Sin conexión a internet', {
          description: 'Algunas funciones pueden no estar disponibles'
        });
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);
  
  return (
    <PageTransition>
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <BackButton />
        
        <div className="w-full max-w-md flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-[#7DC4E0]/20 border-2 border-[#7DC4E0]/40 flex items-center justify-center mb-6 shadow-md"
          >
            {editingCharacter ? (
              <Edit3 size={40} className="text-[#7DC4E0]" />
            ) : (
              <Users size={40} className="text-[#7DC4E0]" />
            )}
          </motion.div>
          
          <h1 className="text-3xl font-bold text-[#BB79D1] mb-6 text-center font-heading drop-shadow-lg">
            {editingCharacter ? 'Edit Character' : 'Create Character'}
          </h1>
          
          <p className="text-lg text-[#222] bg-white/80 rounded-xl px-4 py-2 text-center mb-8 font-medium shadow-sm">
            {editingCharacter ? 'Modify your character\'s intimate details' : 'Create your custom character for unique erotic stories'}
          </p>
          
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Name field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#BB79D1] flex items-center gap-2">
                <User size={16} />
                Character name
              </label>
              <div className={`relative transition-all duration-300 ease-in-out ${isFocused ? 'scale-105' : 'scale-100'}`}>
                <Input 
                  value={character.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: Alex, María, Jordan..."
                  className={`text-lg h-14 font-medium rounded-xl shadow-md transition-all ${
                    errors.name 
                      ? 'border-[#F6A5B7] text-[#F6A5B7] bg-[#F6A5B7]/10' 
                      : 'text-[#222] bg-white/90 border-[#BB79D1]/30 focus:border-[#BB79D1] focus:ring-2 focus:ring-[#BB79D1]/20'
                  } placeholder:text-[#BB79D1]/50`}
                  autoFocus
                  disabled={loading}
                />
                {errors.name && (
                  <div className="mt-2 flex items-center text-[#F6A5B7] gap-2 p-2 bg-white/80 rounded-lg border border-[#F6A5B7]/30 shadow-sm">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">{errors.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gender selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#BB79D1] flex items-center gap-2">
                <Users size={16} />
                Character gender
              </label>
              <Select
                value={character.gender}
                onValueChange={(value) => handleFieldChange('gender', value)}
                disabled={loading}
              >
                <SelectTrigger className={`h-14 text-lg font-medium rounded-xl shadow-md bg-white/90 border-[#BB79D1]/30 focus:border-[#BB79D1] focus:ring-2 focus:ring-[#BB79D1]/20 ${loading ? 'opacity-50' : ''}`}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male" className="text-lg py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">♂</span>
                      Male
                    </div>
                  </SelectItem>
                  <SelectItem value="female" className="text-lg py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-600">♀</span>
                      Female
                    </div>
                  </SelectItem>
                  <SelectItem value="non-binary" className="text-lg py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">⚧</span>
                      Non-binary
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#BB79D1] flex items-center gap-2">
                <Edit3 size={16} />
                Character description
              </label>
              <div className="relative">
                <Textarea
                  value={character.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      handleFieldChange('description', e.target.value);
                    }
                  }}
                  placeholder="Describe your character: personality, appearance, desires, profession, hobbies, preferences, fantasies..."
                  className={`min-h-[120px] text-base font-medium rounded-xl shadow-md transition-all resize-none ${
                    errors.description 
                      ? 'border-[#F6A5B7] text-[#F6A5B7] bg-[#F6A5B7]/10' 
                      : 'text-[#222] bg-white/90 border-[#BB79D1]/30 focus:border-[#BB79D1] focus:ring-2 focus:ring-[#BB79D1]/20'
                  } placeholder:text-[#BB79D1]/50`}
                  disabled={loading}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 text-xs text-[#BB79D1]/60 bg-white/80 rounded px-2 py-1">
                  {character.description.length}/500
                </div>
                {errors.description && (
                  <div className="mt-2 flex items-center text-[#F6A5B7] gap-2 p-2 bg-white/80 rounded-lg border border-[#F6A5B7]/30 shadow-sm">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">{errors.description}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#7DC4E0] bg-white/60 rounded-lg px-3 py-2">
                ✨ The more detailed the description, the more personalized and intimate your stories will be
              </p>
            </div>
            
            {/* Buttons */}
            <div className={`flex gap-4 w-full ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <button
                type="button"
                onClick={() => navigate(fromManagement ? "/characters-management" : "/character-selection")}
                className={`${isMobile ? 'w-full' : 'w-[48%]'} text-lg py-4 shadow-md hover:shadow-lg transition-all rounded-2xl font-medium bg-white/70 hover:bg-white/90 text-[#BB79D1] border border-[#BB79D1]/30 disabled:opacity-50`}
                disabled={loading}
              >
                Back
              </button>
              
              <button
                type="submit"
                className={`${isMobile ? 'w-full' : 'w-[48%]'} text-lg py-4 shadow-md hover:shadow-lg transition-all bg-[#BB79D1] hover:bg-[#BB79D1]/80 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                disabled={loading || !character.name.trim() || !character.description.trim()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {editingCharacter ? 'Update' : 'Create'} Character
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
