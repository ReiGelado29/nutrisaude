import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { FoodConsumptionWithFood, ExerciseRecordWithExercise, WaterConsumption, WeightRecord } from '../types/database';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Apple, Dumbbell, Droplets, Scale, Trash2, Loader2 } from 'lucide-react';
import { MEAL_TYPE_LABELS } from '../lib/nutrition';

type ViewMode = 'day' | 'week' | 'month';

interface DayData {
  foods: FoodConsumptionWithFood[];
  exercises: ExerciseRecordWithExercise[];
  water: WaterConsumption[];
  weight: WeightRecord | null;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    water: number;
    exerciseCalories: number;
  };
}

export function History() {
  const { user, goals } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user, selectedDate]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const dayStart = startOfDay(selectedDate).toISOString();
    const dayEnd = endOfDay(selectedDate).toISOString();

    const { data: foodData } = await supabase
      .from('food_consumption')
      .select('*, food:foods(*)')
      .eq('user_id', user.id)
      .gte('consumed_at', dayStart)
      .lte('consumed_at', dayEnd)
      .order('consumed_at', { ascending: false });

    const { data: exerciseData } = await supabase
      .from('exercise_records')
      .select('*, exercise:exercises(*)')
      .eq('user_id', user.id)
      .gte('performed_at', dayStart)
      .lte('performed_at', dayEnd)
      .order('performed_at', { ascending: false });

    const { data: waterData } = await supabase
      .from('water_consumption')
      .select('*')
      .eq('user_id', user.id)
      .gte('consumed_at', dayStart)
      .lte('consumed_at', dayEnd)
      .order('consumed_at', { ascending: false });

    const { data: weightData } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('recorded_at', selectedDate.toISOString().split('T')[0])
      .single();

    let calories = 0, protein = 0, carbs = 0, fats = 0, fiber = 0;
    const foods = (foodData || []) as unknown as FoodConsumptionWithFood[];

    foods.forEach((item) => {
      if (item.food) {
        const multiplier = item.amount / 100;
        calories += (item.food.calories || 0) * multiplier;
        protein += (item.food.protein_g || 0) * multiplier;
        carbs += (item.food.carbs_g || 0) * multiplier;
        fats += (item.food.fats_g || 0) * multiplier;
        fiber += (item.food.fiber_g || 0) * multiplier;
      }
    });

    const exercises = (exerciseData || []) as unknown as ExerciseRecordWithExercise[];
    const exerciseCalories = exercises.reduce((sum, item) => sum + item.calories_burned, 0);
    const water = (waterData || []).reduce((sum, item) => sum + item.amount_ml, 0);

    setDayData({
      foods,
      exercises,
      water: waterData || [],
      weight: weightData as WeightRecord | null,
      totals: { calories, protein, carbs, fats, fiber, water, exerciseCalories },
    });

    setLoading(false);
  };

  const deleteFoodEntry = async (id: string) => {
    await supabase.from('food_consumption').delete().eq('id', id);
    fetchData();
  };

  const deleteExerciseEntry = async (id: string) => {
    await supabase.from('exercise_records').delete().eq('id', id);
    fetchData();
  };

  const deleteWaterEntry = async (id: string) => {
    await supabase.from('water_consumption').delete().eq('id', id);
    fetchData();
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getDateLabel = () => {
    if (viewMode === 'day') return format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    if (viewMode === 'week') {
      const start = startOfDay(subDays(selectedDate, selectedDate.getDay()));
      const end = subDays(start, -6);
      return `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM', { locale: ptBR })}`;
    }
    return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="p-4 lg:p-6 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Histórico</h1>

          {/* View Mode */}
          <div className="flex gap-2 mb-4">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); setSelectedDate(new Date()); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                }`}
              >
                {mode === 'day' && 'Dia'}
                {mode === 'week' && 'Semana'}
                {mode === 'month' && 'Mês'}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between bg-secondary-100 dark:bg-secondary-700 rounded-xl p-3">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary-500" />
              <span className="font-medium text-secondary-900 dark:text-white capitalize">
                {getDateLabel()}
              </span>
            </div>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded-lg">
              <ChevronRight className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : dayData ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Calorias', value: Math.round(dayData.totals.calories), unit: 'kcal', target: goals?.calories },
                { label: 'Proteína', value: Math.round(dayData.totals.protein), unit: 'g', target: goals?.protein_g },
                { label: 'Carboidratos', value: Math.round(dayData.totals.carbs), unit: 'g', target: goals?.carbs_g },
                { label: 'Gorduras', value: Math.round(dayData.totals.fats), unit: 'g', target: goals?.fats_g },
                { label: 'Fibras', value: Math.round(dayData.totals.fiber), unit: 'g', target: goals?.fiber_g },
                { label: 'Água', value: Math.round(dayData.totals.water / 1000), unit: 'L', target: goals?.water_ml ? Math.round(goals.water_ml / 1000) * 1000 : undefined },
                { label: 'Exercício', value: Math.round(dayData.totals.exerciseCalories), unit: 'kcal', target: undefined },
                { label: 'Peso', value: dayData.weight?.weight_kg?.toFixed(1) || '--', unit: 'kg', target: undefined },
              ].map((stat) => (
                <div key={stat.label} className="stat-card">
                  <span className="text-xs text-secondary-500">{stat.label}</span>
                  <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {stat.value} <span className="text-sm font-normal text-secondary-500">{stat.unit}</span>
                  </p>
                  {stat.target && (
                    <p className="text-xs text-secondary-400">de {Math.round(stat.target as number)} {stat.unit}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Food Entries */}
            {dayData.foods.length > 0 && (
              <div className="card p-4">
                <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <Apple className="w-5 h-5 text-primary-500" />
                  Alimentos ({dayData.foods.length})
                </h2>
                <div className="space-y-3">
                  {dayData.foods.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-700 last:border-0">
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">{entry.food?.name}</p>
                        <p className="text-xs text-secondary-500">
                          {entry.amount}g · {entry.meal_type ? MEAL_TYPE_LABELS[entry.meal_type] : ''} · {format(parseISO(entry.consumed_at), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-secondary-600 dark:text-secondary-400">
                          {Math.round((entry.food?.calories || 0) * (entry.amount / 100))} kcal
                        </span>
                        <button onClick={() => deleteFoodEntry(entry.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise Entries */}
            {dayData.exercises.length > 0 && (
              <div className="card p-4">
                <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-accent-500" />
                  Exercícios ({dayData.exercises.length})
                </h2>
                <div className="space-y-3">
                  {dayData.exercises.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-700 last:border-0">
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">{entry.exercise?.name}</p>
                        <p className="text-xs text-secondary-500">
                          {entry.duration_min} min · {format(parseISO(entry.performed_at), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-secondary-600 dark:text-secondary-400">
                          {Math.round(entry.calories_burned)} kcal
                        </span>
                        <button onClick={() => deleteExerciseEntry(entry.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Water Entries */}
            {dayData.water.length > 0 && (
              <div className="card p-4">
                <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Água ({dayData.water.length})
                </h2>
                <div className="space-y-2">
                  {dayData.water.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-700 last:border-0">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-secondary-900 dark:text-white">{Math.round(entry.amount_ml)} ml</span>
                        <span className="text-xs text-secondary-500">{format(parseISO(entry.consumed_at), 'HH:mm')}</span>
                      </div>
                      <button onClick={() => deleteWaterEntry(entry.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weight */}
            {dayData.weight && (
              <div className="card p-4">
                <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-secondary-500" />
                  Peso
                </h2>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {dayData.weight.weight_kg.toFixed(1)} kg
                </p>
              </div>
            )}

            {dayData.foods.length === 0 && dayData.exercises.length === 0 && dayData.water.length === 0 && !dayData.weight && (
              <div className="text-center py-12">
                <p className="text-secondary-500">Nenhum registro encontrado para este dia</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
