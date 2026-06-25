import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Food, FoodWithFavorite, MealType } from '../types/database';
import { X, Search, Star, Loader2 } from 'lucide-react';
import { MEAL_TYPE_LABELS } from '../lib/nutrition';

interface QuickAddFoodProps {
  date: Date;
  onClose: () => void;
}

export function QuickAddFood({ date, onClose }: QuickAddFoodProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState<FoodWithFavorite[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [amount, setAmount] = useState('100');
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'all'>('favorites');

  useEffect(() => {
    fetchFavorites();
    fetchRecent();
  }, [user]);

  useEffect(() => {
    if (search.length >= 2) {
      searchFoods();
    } else if (search.length === 0) {
      setFoods([]);
    }
  }, [search]);

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('food_favorites')
      .select('food_id')
      .eq('user_id', user.id);
    if (data) {
      setFavorites(data.map((f) => f.food_id));
    }
  };

  const fetchRecent = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('food_consumption')
      .select('food:foods(*)')
      .eq('user_id', user.id)
      .order('consumed_at', { ascending: false })
      .limit(10);
    if (data) {
      const foods = data.map((item) => item.food as unknown as Food).filter(Boolean);
      const uniqueFoods = foods.filter(
        (food, index, self) => index === self.findIndex((f) => f?.id === food?.id)
      );
      setRecent(uniqueFoods.slice(0, 5));
    }
  };

  const searchFoods = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${search}%`)
      .limit(20);
    if (data) {
      setFoods(
        data.map((food) => ({
          ...food,
          is_favorite: favorites.includes(food.id),
        }))
      );
    }
  };

  const toggleFavorite = async (foodId: string) => {
    if (!user) return;
    const isFavorite = favorites.includes(foodId);
    if (isFavorite) {
      await supabase.from('food_favorites').delete().eq('user_id', user.id).eq('food_id', foodId);
      setFavorites(favorites.filter((id) => id !== foodId));
    } else {
      await supabase.from('food_favorites').insert({ user_id: user.id, food_id: foodId });
      setFavorites([...favorites, foodId]);
    }
  };

  const handleAdd = async () => {
    if (!user || !selectedFood || !mealType) return;
    setLoading(true);

    const multiplier = parseFloat(amount) / 100;
    const calories = Math.round(selectedFood.calories * multiplier);

    await supabase.from('food_consumption').insert({
      user_id: user.id,
      food_id: selectedFood.id,
      amount: parseFloat(amount),
      consumed_at: date.toISOString(),
      meal_type: mealType,
    });

    setLoading(false);
    onClose();
  };

  const getDisplayFoods = () => {
    if (selectedFood) return [];
    if (search.length >= 2) return foods;
    if (activeTab === 'favorites') {
      return foods.filter((f) => favorites.includes(f.id));
    }
    if (activeTab === 'recent') {
      return recent.map((f) => ({ ...f, is_favorite: favorites.includes(f.id) }));
    }
    return foods;
  };

  const displayFoods = getDisplayFoods();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-white dark:bg-secondary-800 w-full lg:max-w-lg lg:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            {selectedFood ? 'Quantidade' : 'Adicionar Alimento'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {selectedFood ? (
          // Amount Selection
          <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-2xl">{selectedFood.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">{selectedFood.name}</p>
                <p className="text-sm text-secondary-500">{selectedFood.category}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Quantidade ({selectedFood.serving_unit})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                min={1}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Refeição
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack', 'other'] as MealType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-2 rounded-xl text-sm font-medium transition-all ${
                      mealType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                    }`}
                  >
                    {MEAL_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary-100 dark:bg-secondary-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-500">Calorias</span>
                  <p className="font-semibold text-secondary-900 dark:text-white">
                    {Math.round(selectedFood.calories * (parseFloat(amount) / 100))} kcal
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500">Proteína</span>
                  <p className="font-semibold text-secondary-900 dark:text-white">
                    {Math.round(selectedFood.protein_g * (parseFloat(amount) / 100))}g
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500">Carboidratos</span>
                  <p className="font-semibold text-secondary-900 dark:text-white">
                    {Math.round(selectedFood.carbs_g * (parseFloat(amount) / 100))}g
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500">Gorduras</span>
                  <p className="font-semibold text-secondary-900 dark:text-white">
                    {Math.round(selectedFood.fats_g * (parseFloat(amount) / 100))}g
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedFood(null)} className="btn-secondary flex-1">
                Voltar
              </button>
              <button
                onClick={handleAdd}
                disabled={loading || !mealType || !amount}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Adicionar'
                )}
              </button>
            </div>
          </div>
        ) : (
          // Food Selection
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
                  placeholder="Buscar alimento..."
                  autoFocus
                />
              </div>
            </div>

            {/* Tabs */}
            {search.length < 2 && (
              <div className="flex px-4 gap-2">
                {(['favorites', 'recent', 'all'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === 'all') searchFoods();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                    }`}
                  >
                    {tab === 'favorites' && <Star className="w-4 h-4" />}
                    {tab === 'favorites' && ' Favoritos'}
                    {tab === 'recent' && 'Recentes'}
                    {tab === 'all' && 'Todos'}
                  </button>
                ))}
              </div>
            )}

            {/* Food List */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {displayFoods.length === 0 && search.length >= 2 && (
                <p className="text-center text-secondary-500 py-8">Nenhum alimento encontrado</p>
              )}

              {displayFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
                >
                  <button
                    onClick={() => setSelectedFood(food)}
                    className="flex-1 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {food.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-secondary-900 dark:text-white">{food.name}</p>
                      <p className="text-xs text-secondary-500">
                        {Math.round(food.calories)} kcal · {food.category}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(food.id);
                    }}
                    className="p-2 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded-lg"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        favorites.includes(food.id)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-secondary-400'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
