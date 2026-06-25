import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Exercise, ExerciseInsert } from '../types/database';
import { Plus, Search, Edit2, Trash2, X, Loader2, Flame } from 'lucide-react';

const EXERCISE_CATEGORIES = ['Cardio', 'Strength', 'Sports', 'Flexibility', 'Other'];

const blankExercise: Omit<ExerciseInsert, 'user_id'> & { user_id?: string } = {
  name: '',
  calories_per_min: 5,
  category: 'Other',
  is_public: false,
};

export function Exercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<(Omit<ExerciseInsert, 'user_id'> & { user_id?: string }) | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [user]);

  useEffect(() => {
    if (showModal) {
      if (editingExercise) {
        setFormData({
          ...editingExercise,
          user_id: editingExercise.user_id || undefined,
        });
      } else {
        setFormData({ ...blankExercise });
      }
    }
  }, [showModal, editingExercise]);

  const fetchExercises = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('name');
    if (data) setExercises(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user || !formData) return;
    setSaving(true);

    if (editingExercise) {
      const updateData = { ...formData, updated_at: new Date().toISOString() };
      delete updateData.user_id;
      delete (updateData as { id?: string }).id;
      await supabase.from('exercises').update(updateData).eq('id', editingExercise.id);
    } else {
      await supabase.from('exercises').insert({ ...formData, user_id: user.id });
    }

    setSaving(false);
    setShowModal(false);
    setEditingExercise(null);
    fetchExercises();
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm('Excluir este exercício?')) return;
    await supabase.from('exercises').delete().eq('id', exerciseId);
    fetchExercises();
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || exercise.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(exercises.map((e) => e.category).filter(Boolean))];

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="p-4 lg:p-6 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Exercícios</h1>
            <button onClick={() => { setShowModal(true); setEditingExercise(null); }} className="btn-primary">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Novo Exercício</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Buscar exercício..."
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !category
                  ? 'bg-accent-500 text-white'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-accent-500 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="card p-4 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary-900 dark:text-white truncate">
                    {exercise.name}
                  </p>
                  <p className="text-xs text-secondary-500 mb-2">{exercise.category}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-accent-500" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      {exercise.calories_per_min} kcal/min
                    </span>
                  </div>
                </div>
                {exercise.user_id === user?.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingExercise(exercise); setShowModal(true); }}
                      className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-secondary-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && formData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-secondary-800 w-full max-w-md rounded-2xl animate-scale-in">
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingExercise(null); }} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Ex: Corrida"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  {EXERCISE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Calorias por minuto
                </label>
                <input
                  type="number"
                  value={formData.calories_per_min || ''}
                  onChange={(e) => setFormData({ ...formData, calories_per_min: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min={0}
                  step={0.5}
                />
              </div>

              <div className="p-4 rounded-xl bg-secondary-100 dark:bg-secondary-700">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Exemplo: 30 minutos = <strong className="text-secondary-900 dark:text-white">
                    {Math.round((formData.calories_per_min || 0) * 30)} kcal
                  </strong>
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex gap-3">
              <button onClick={() => { setShowModal(false); setEditingExercise(null); }} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !formData.name} className="btn-primary flex-1">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
