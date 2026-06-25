import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Exercise } from '../types/database';
import { X, Search, Loader2, Clock, Flame } from 'lucide-react';

interface QuickAddExerciseProps {
  date: Date;
  onClose: () => void;
}

export function QuickAddExercise({ date, onClose }: QuickAddExerciseProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [recent, setRecent] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecent();
    fetchExercises();
  }, [user]);

  useEffect(() => {
    if (search.length >= 2) {
      searchExercises();
    }
  }, [search]);

  const fetchRecent = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('exercise_records')
      .select('exercise:exercises(*)')
      .eq('user_id', user.id)
      .order('performed_at', { ascending: false })
      .limit(10);
    if (data) {
      const exercises = data.map((item) => item.exercise as unknown as Exercise).filter(Boolean);
      const uniqueExercises = exercises.filter(
        (exercise, index, self) => index === self.findIndex((e) => e?.id === exercise?.id)
      );
      setRecent(uniqueExercises.slice(0, 5));
    }
  };

  const fetchExercises = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .limit(30);
    if (data) {
      setExercises(data);
    }
  };

  const searchExercises = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${search}%`)
      .limit(20);
    if (data) {
      setExercises(data);
    }
  };

  const handleAdd = async () => {
    if (!user || !selectedExercise) return;
    setLoading(true);

    const durationMin = parseInt(duration);
    const caloriesBurned = Math.round(selectedExercise.calories_per_min * durationMin);

    await supabase.from('exercise_records').insert({
      user_id: user.id,
      exercise_id: selectedExercise.id,
      duration_min: durationMin,
      calories_burned: caloriesBurned,
      performed_at: date.toISOString(),
    });

    setLoading(false);
    onClose();
  };

  const displayExercises = search.length >= 2 ? exercises : recent.length > 0 ? recent : exercises;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-white dark:bg-secondary-800 w-full lg:max-w-lg lg:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            {selectedExercise ? 'Duração' : 'Registrar Exercício'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {selectedExercise ? (
          // Duration Selection
          <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                <span className="text-2xl">{selectedExercise.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">{selectedExercise.name}</p>
                <p className="text-sm text-secondary-500">
                  {selectedExercise.calories_per_min} kcal/min
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input"
                min={1}
                max={480}
              />
            </div>

            <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">{duration}</p>
                  <p className="text-sm text-secondary-500">minutos</p>
                </div>
                <div className="text-4xl text-secondary-300">=</div>
                <div className="text-center">
                  <Flame className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {Math.round(selectedExercise.calories_per_min * parseInt(duration))}
                  </p>
                  <p className="text-sm text-secondary-500">kcal</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedExercise(null)} className="btn-secondary flex-1">
                Voltar
              </button>
              <button onClick={handleAdd} disabled={loading || !duration} className="btn-primary flex-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar'}
              </button>
            </div>
          </div>
        ) : (
          // Exercise Selection
          <div className="flex flex-col h-[70vh] lg:h-[500px]">
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                  placeholder="Buscar exercício..."
                  autoFocus
                />
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {displayExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                    <span className="font-semibold text-accent-600 dark:text-accent-400">
                      {exercise.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-secondary-900 dark:text-white">{exercise.name}</p>
                    <p className="text-xs text-secondary-500">
                      {exercise.calories_per_min} kcal/min · {exercise.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
