import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Food, FoodInsert } from '../types/database';
import { Plus, Search, Edit2, Trash2, Star, X, Loader2 } from 'lucide-react';

const FOOD_CATEGORIES = [
  'Proteínas',
  'Carboidratos',
  'Frutas',
  'Vegetais',
  'Laticínios',
  'Oleaginosas',
  'Leguminosas',
  'Bebidas',
  'Lanches',
  'Outros',
];

const blankFood: Omit<FoodInsert, 'user_id'> & { user_id?: string } = {
  name: '',
  category: 'Outros',
  serving_unit: 'g',
  serving_size: 100,
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fats_g: 0,
  fiber_g: 0,
  vit_a_mcg: 0,
  vit_b1_mg: 0,
  vit_b2_mg: 0,
  vit_b3_mg: 0,
  vit_b5_mg: 0,
  vit_b6_mg: 0,
  vit_b7_mcg: 0,
  vit_b9_mcg: 0,
  vit_b12_mcg: 0,
  vit_c_mg: 0,
  vit_d_mcg: 0,
  vit_e_mg: 0,
  vit_k_mcg: 0,
  calcium_mg: 0,
  iron_mg: 0,
  magnesium_mg: 0,
  zinc_mg: 0,
  potassium_mg: 0,
  phosphorus_mg: 0,
  selenium_mcg: 0,
  sodium_mg: 0,
  copper_mg: 0,
  manganese_mg: 0,
  iodine_mcg: 0,
  is_public: false,
};

export function Foods() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<(Omit<FoodInsert, 'user_id'> & { user_id?: string }) | null>(null);

  useEffect(() => {
    fetchFoods();
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    if (showModal) {
      if (editingFood) {
        setFormData({
          ...editingFood,
          user_id: editingFood.user_id || undefined,
        });
      } else {
        setFormData({ ...blankFood });
      }
    }
  }, [showModal, editingFood]);

  const fetchFoods = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('foods').select('*').or(`user_id.eq.${user.id},is_public.eq.true`).order('name');
    if (data) setFoods(data);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from('food_favorites').select('food_id').eq('user_id', user.id);
    if (data) setFavorites(data.map((f) => f.food_id));
  };

  const toggleFavorite = async (foodId: string) => {
    if (!user) return;
    const isFavorite = favorites.includes(foodId);
    if (isFavorite) {
      await supabase.from('food_favorites').delete().match({ user_id: user.id, food_id: foodId });
      setFavorites(favorites.filter((id) => id !== foodId));
    } else {
      await supabase.from('food_favorites').insert({ user_id: user.id, food_id: foodId });
      setFavorites([...favorites, foodId]);
    }
  };

  const handleSave = async () => {
    if (!user || !formData) return;
    setSaving(true);

    if (editingFood) {
      const updateData = { ...formData, updated_at: new Date().toISOString() };
      delete updateData.user_id;
      delete (updateData as { id?: string }).id;
      await supabase.from('foods').update(updateData).eq('id', editingFood.id);
    } else {
      await supabase.from('foods').insert({ ...formData, user_id: user.id });
    }

    setSaving(false);
    setShowModal(false);
    setEditingFood(null);
    fetchFoods();
  };

  const handleDelete = async (foodId: string) => {
    if (!confirm('Excluir este alimento?')) return;
    await supabase.from('foods').delete().eq('id', foodId);
    fetchFoods();
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || food.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(foods.map((f) => f.category).filter(Boolean))];

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="p-4 lg:p-6 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Alimentos</h1>
            <button onClick={() => { setShowModal(true); setEditingFood(null); }} className="btn-primary">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Novo Alimento</span>
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
              placeholder="Buscar alimento..."
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !category
                  ? 'bg-primary-500 text-white'
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
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food List */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="card p-4 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-secondary-900 dark:text-white truncate">
                      {food.name}
                    </p>
                    {favorites.includes(food.id) && (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-secondary-500 mb-2">{food.category}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400">
                      {Math.round(food.calories)} kcal
                    </span>
                    <span className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      P: {Math.round(food.protein_g)}g
                    </span>
                    <span className="px-2 py-1 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                      C: {Math.round(food.carbs_g)}g
                    </span>
                    <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                      G: {Math.round(food.fats_g)}g
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleFavorite(food.id)}
                    className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites.includes(food.id)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-secondary-400'
                      }`}
                    />
                  </button>
                  {food.user_id === user?.id && (
                    <>
                      <button
                        onClick={() => { setEditingFood(food); setShowModal(true); }}
                        className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-secondary-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && formData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-secondary-800 w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden animate-scale-in my-8">
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between sticky top-0 bg-inherit z-10">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                {editingFood ? 'Editar Alimento' : 'Novo Alimento'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingFood(null); }} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Categoria</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Porção (g)</label>
                  <input
                    type="number"
                    value={formData.serving_size || ''}
                    onChange={(e) => setFormData({ ...formData, serving_size: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
                <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Macronutrientes (por 100g)</h3>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  {[
                    { key: 'calories', label: 'Calorias', unit: 'kcal' },
                    { key: 'protein_g', label: 'Proteína', unit: 'g' },
                    { key: 'carbs_g', label: 'Carboidratos', unit: 'g' },
                    { key: 'fats_g', label: 'Gorduras', unit: 'g' },
                    { key: 'fiber_g', label: 'Fibras', unit: 'g' },
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block text-xs text-secondary-500 mb-1">{label} ({unit})</label>
                      <input
                        type="number"
                        value={(formData as Record<string, number>)[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                        className="input"
                        step={key === 'calories' ? 1 : 0.1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <details className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
                <summary className="cursor-pointer font-medium text-secondary-900 dark:text-white mb-3">
                  Vitaminas (por 100g)
                </summary>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  {[
                    { key: 'vit_a_mcg', label: 'Vit A', unit: 'mcg' },
                    { key: 'vit_b1_mg', label: 'Vit B1', unit: 'mg' },
                    { key: 'vit_b2_mg', label: 'Vit B2', unit: 'mg' },
                    { key: 'vit_b3_mg', label: 'Vit B3', unit: 'mg' },
                    { key: 'vit_b5_mg', label: 'Vit B5', unit: 'mg' },
                    { key: 'vit_b6_mg', label: 'Vit B6', unit: 'mg' },
                    { key: 'vit_b7_mcg', label: 'Vit B7', unit: 'mcg' },
                    { key: 'vit_b9_mcg', label: 'Vit B9', unit: 'mcg' },
                    { key: 'vit_b12_mcg', label: 'Vit B12', unit: 'mcg' },
                    { key: 'vit_c_mg', label: 'Vit C', unit: 'mg' },
                    { key: 'vit_d_mcg', label: 'Vit D', unit: 'mcg' },
                    { key: 'vit_e_mg', label: 'Vit E', unit: 'mg' },
                    { key: 'vit_k_mcg', label: 'Vit K', unit: 'mcg' },
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block text-xs text-secondary-500 mb-1">{label} ({unit})</label>
                      <input
                        type="number"
                        step={unit === 'mcg' ? 1 : 0.1}
                        value={(formData as Record<string, number>)[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
              </details>

              <details className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
                <summary className="cursor-pointer font-medium text-secondary-900 dark:text-white mb-3">
                  Minerais (por 100g)
                </summary>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  {[
                    { key: 'calcium_mg', label: 'Cálcio', unit: 'mg' },
                    { key: 'iron_mg', label: 'Ferro', unit: 'mg' },
                    { key: 'magnesium_mg', label: 'Magnésio', unit: 'mg' },
                    { key: 'zinc_mg', label: 'Zinco', unit: 'mg' },
                    { key: 'potassium_mg', label: 'Potássio', unit: 'mg' },
                    { key: 'phosphorus_mg', label: 'Fósforo', unit: 'mg' },
                    { key: 'selenium_mcg', label: 'Selênio', unit: 'mcg' },
                    { key: 'sodium_mg', label: 'Sódio', unit: 'mg' },
                    { key: 'copper_mg', label: 'Cobre', unit: 'mg' },
                    { key: 'manganese_mg', label: 'Manganês', unit: 'mg' },
                    { key: 'iodine_mcg', label: 'Iodo', unit: 'mcg' },
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block text-xs text-secondary-500 mb-1">{label} ({unit})</label>
                      <input
                        type="number"
                        step={unit === 'mcg' ? 1 : 0.1}
                        value={(formData as Record<string, number>)[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
              </details>
            </div>

            <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex gap-3">
              <button onClick={() => { setShowModal(false); setEditingFood(null); }} className="btn-secondary flex-1">
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
