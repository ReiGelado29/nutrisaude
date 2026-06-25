import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateTMB, calculateGET, calculateAge, getProgressColor } from '../lib/nutrition';
import type { FoodConsumptionWithFood, ExerciseRecordWithExercise, Food } from '../types/database';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Apple,
  Droplets,
  Flame,
  Scale,
  TrendingUp,
  TrendingDown,
  Plus,
  GlassWater,
  Dumbbell,
  ChevronRight,
} from 'lucide-react';
import { QuickAddFood } from '../components/QuickAddFood';
import { QuickAddExercise } from '../components/QuickAddExercise';
import { QuickAddWater } from '../components/QuickAddWater';
import { QuickAddWeight } from '../components/QuickAddWeight';

interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
  exerciseCalories: number;
}

interface WeightStats {
  current: number | null;
  initial: number | null;
  target: number | null;
  avg7Days: number | null;
  avg30Days: number | null;
}

function MacroProgress({
  label,
  current,
  target,
  unit,
  color = 'primary',
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color?: string;
}) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 150) : 0;
  const progressColor = getProgressColor(percentage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
          {label}
        </span>
        <span className="text-sm text-secondary-500">
          {Math.round(current)}/{Math.round(target)}{unit}
        </span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${progressColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, profile, goals } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    water: 0,
    exerciseCalories: 0,
  });
  const [weightStats, setWeightStats] = useState<WeightStats>({
    current: null,
    initial: null,
    target: null,
    avg7Days: null,
    avg30Days: null,
  });
  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDailyStats = useCallback(async () => {
    if (!user) return;

    const dayStart = startOfDay(selectedDate).toISOString();
    const dayEnd = endOfDay(selectedDate).toISOString();

    const { data: foodData } = await supabase
      .from('food_consumption')
      .select('amount, food:foods(calories, protein_g, carbs_g, fats_g, fiber_g)')
      .eq('user_id', user.id)
      .gte('consumed_at', dayStart)
      .lte('consumed_at', dayEnd);

    const { data: waterData } = await supabase
      .from('water_consumption')
      .select('amount_ml')
      .eq('user_id', user.id)
      .gte('consumed_at', dayStart)
      .lte('consumed_at', dayEnd);

    const { data: exerciseData } = await supabase
      .from('exercise_records')
      .select('calories_burned')
      .eq('user_id', user.id)
      .gte('performed_at', dayStart)
      .lte('performed_at', dayEnd);

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let fiber = 0;

    if (foodData) {
      foodData.forEach((item) => {
        const food = item.food as unknown as Food;
        const multiplier = item.amount / 100;
        calories += (food?.calories || 0) * multiplier;
        protein += (food?.protein_g || 0) * multiplier;
        carbs += (food?.carbs_g || 0) * multiplier;
        fats += (food?.fats_g || 0) * multiplier;
        fiber += (food?.fiber_g || 0) * multiplier;
      });
    }

    const water = waterData?.reduce((sum, item) => sum + item.amount_ml, 0) || 0;
    const exerciseCalories = exerciseData?.reduce((sum, item) => sum + item.calories_burned, 0) || 0;

    setDailyStats({ calories, protein, carbs, fats, fiber, water, exerciseCalories });
  }, [user, selectedDate]);

  const fetchWeightStats = useCallback(async () => {
    if (!user || !profile) return;

    const { data: weights } = await supabase
      .from('weight_records')
      .select('weight_kg, recorded_at')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true });

    if (weights && weights.length > 0) {
      const sorted = [...weights].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
      const current = sorted[0]?.weight_kg || null;
      const initial = sorted[sorted.length - 1]?.weight_kg || null;

      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const thirtyDaysAgo = subDays(now, 30);

      const last7Days = weights.filter((w) => new Date(w.recorded_at) >= sevenDaysAgo);
      const last30Days = weights.filter((w) => new Date(w.recorded_at) >= thirtyDaysAgo);

      const avg7 = last7Days.length > 0
        ? last7Days.reduce((sum, w) => sum + w.weight_kg, 0) / last7Days.length
        : null;
      const avg30 = last30Days.length > 0
        ? last30Days.reduce((sum, w) => sum + w.weight_kg, 0) / last30Days.length
        : null;

      setWeightStats({
        current,
        initial,
        target: profile.target_weight_kg,
        avg7Days: avg7,
        avg30Days: avg30,
      });
    } else {
      setWeightStats({
        current: profile.current_weight_kg,
        initial: profile.current_weight_kg,
        target: profile.target_weight_kg,
        avg7Days: null,
        avg30Days: null,
      });
    }
  }, [user, profile]);

  const fetchRecentFoods = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('food_consumption')
      .select('food:foods(*)')
      .eq('user_id', user.id)
      .order('consumed_at', { ascending: false })
      .limit(5);

    if (data) {
      const foods = data.map((item) => item.food as unknown as Food).filter(Boolean);
      const uniqueFoods = foods.filter(
        (food, index, self) => index === self.findIndex((f) => f?.id === food?.id)
      );
      setRecentFoods(uniqueFoods.slice(0, 5));
    }
  }, [user]);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchDailyStats(), fetchWeightStats(), fetchRecentFoods()]);
      setLoading(false);
    };

    fetchAll();
  }, [user, profile, selectedDate, fetchDailyStats, fetchWeightStats, fetchRecentFoods]);

  const handleRefresh = () => {
    fetchDailyStats();
    fetchWeightStats();
    fetchRecentFoods();
  };

  if (!profile || !goals) {
    return null;
  }

  const age = calculateAge(profile.birthdate);
  const tmb = calculateTMB(profile.current_weight_kg, profile.height_cm, age, profile.sex);
  const get = calculateGET(tmb, profile.activity_level);
  const netCalories = dailyStats.calories - dailyStats.exerciseCalories;
  const calorieGoal = goals.calories || 2000;

  const getWeightDiff = () => {
    if (!weightStats.current || !weightStats.initial) return null;
    return weightStats.current - weightStats.initial;
  };

  const weightDiff = getWeightDiff();

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="p-4 lg:p-6 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                Olá, {profile.name.split(' ')[0]}
              </p>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Dashboard</h1>
            </div>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
              className="input w-auto text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-secondary-500 mb-1">
              <Scale className="w-4 h-4" />
              <span className="text-xs">Peso Atual</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
              {weightStats.current ? `${weightStats.current.toFixed(1)} kg` : '--'}
            </p>
            {weightDiff !== null && weightDiff !== 0 && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${weightDiff < 0 ? 'text-primary-500' : 'text-accent-500'}`}>
                {weightDiff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(weightDiff).toFixed(1)} kg
              </p>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-secondary-500 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs">Calorias</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
              {Math.round(netCalories)}
            </p>
            <p className="text-xs text-secondary-500">de {calorieGoal} kcal</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-secondary-500 mb-1">
              <GlassWater className="w-4 h-4" />
              <span className="text-xs">Água</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
              {Math.round(dailyStats.water / 1000)}L
            </p>
            <p className="text-xs text-secondary-500">
              de {Math.round((goals.water_ml || 0) / 1000)}L
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-secondary-500 mb-1">
              <Dumbbell className="w-4 h-4" />
              <span className="text-xs">Exercício</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
              {Math.round(dailyStats.exerciseCalories)}
            </p>
            <p className="text-xs text-secondary-500">kcal gastas</p>
          </div>
        </div>

        {/* TMB/GET Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat-card">
            <span className="text-xs text-secondary-500">TMB</span>
            <p className="text-lg font-semibold text-secondary-900 dark:text-white">
              {Math.round(tmb)} kcal
            </p>
          </div>
          <div className="stat-card">
            <span className="text-xs text-secondary-500">GET</span>
            <p className="text-lg font-semibold text-secondary-900 dark:text-white">
              {Math.round(get)} kcal
            </p>
          </div>
          <div className="stat-card">
            <span className="text-xs text-secondary-500">Média 7 dias</span>
            <p className="text-lg font-semibold text-secondary-900 dark:text-white">
              {weightStats.avg7Days ? `${weightStats.avg7Days.toFixed(1)} kg` : '--'}
            </p>
          </div>
          <div className="stat-card">
            <span className="text-xs text-secondary-500">Meta calórica</span>
            <p className="text-lg font-semibold text-secondary-900 dark:text-white">
              {calorieGoal} kcal
            </p>
          </div>
        </div>

        {/* Macro Progress */}
        <div className="card p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Progresso Diário
          </h2>
          <div className="space-y-4">
            <MacroProgress
              label="Calorias"
              current={netCalories}
              target={calorieGoal}
              unit=" kcal"
            />
            <MacroProgress
              label="Proteínas"
              current={dailyStats.protein}
              target={goals.protein_g || 0}
              unit="g"
            />
            <MacroProgress
              label="Carboidratos"
              current={dailyStats.carbs}
              target={goals.carbs_g || 0}
              unit="g"
            />
            <MacroProgress
              label="Gorduras"
              current={dailyStats.fats}
              target={goals.fats_g || 0}
              unit="g"
            />
            <MacroProgress
              label="Fibras"
              current={dailyStats.fiber}
              target={goals.fiber_g || 0}
              unit="g"
            />
            <MacroProgress
              label="Água"
              current={dailyStats.water}
              target={goals.water_ml || 0}
              unit="ml"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button onClick={() => setShowFoodModal(true)} className="card-hover p-4 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
              <Apple className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-secondary-900 dark:text-white">Adicionar Alimento</span>
          </button>

          <button onClick={() => setShowExerciseModal(true)} className="card-hover p-4 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center group-hover:bg-accent-500 transition-colors">
              <Dumbbell className="w-5 h-5 text-accent-600 dark:text-accent-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-secondary-900 dark:text-white">Registrar Exercício</span>
          </button>

          <button onClick={() => setShowWaterModal(true)} className="card-hover p-4 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-secondary-900 dark:text-white">Adicionar Água</span>
          </button>

          <button onClick={() => setShowWeightModal(true)} className="card-hover p-4 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center group-hover:bg-secondary-500 transition-colors">
              <Scale className="w-5 h-5 text-secondary-600 dark:text-secondary-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-secondary-900 dark:text-white">Registrar Peso</span>
          </button>
        </div>

        {/* Weight Progress */}
        <div className="card p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Evolução do Peso
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <span className="text-xs text-secondary-500">Inicial</span>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                {weightStats.initial ? `${weightStats.initial.toFixed(1)} kg` : '--'}
              </p>
            </div>
            <div>
              <span className="text-xs text-secondary-500">Atual</span>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                {weightStats.current ? `${weightStats.current.toFixed(1)} kg` : '--'}
              </p>
            </div>
            <div>
              <span className="text-xs text-secondary-500">Meta</span>
              <p className="text-lg font-semibold text-primary-500">
                {weightStats.target ? `${weightStats.target.toFixed(1)} kg` : '--'}
              </p>
            </div>
            <div>
              <span className="text-xs text-secondary-500">Média 7 dias</span>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                {weightStats.avg7Days ? `${weightStats.avg7Days.toFixed(1)} kg` : '--'}
              </p>
            </div>
            <div>
              <span className="text-xs text-secondary-500">Média 30 dias</span>
              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                {weightStats.avg30Days ? `${weightStats.avg30Days.toFixed(1)} kg` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Foods */}
        {recentFoods.length > 0 && (
          <div className="card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Alimentos Recentes
              </h2>
              <button
                onClick={() => setShowFoodModal(true)}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
              >
                Adicionar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {recentFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setShowFoodModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Apple className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-secondary-900 dark:text-white">{food.name}</p>
                      <p className="text-xs text-secondary-500">{Math.round(food.calories)} kcal/100g</p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-secondary-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showFoodModal && (
        <QuickAddFood
          date={selectedDate}
          onClose={() => {
            setShowFoodModal(false);
            handleRefresh();
          }}
        />
      )}
      {showExerciseModal && (
        <QuickAddExercise
          date={selectedDate}
          onClose={() => {
            setShowExerciseModal(false);
            handleRefresh();
          }}
        />
      )}
      {showWaterModal && (
        <QuickAddWater
          date={selectedDate}
          onClose={() => {
            setShowWaterModal(false);
            handleRefresh();
          }}
        />
      )}
      {showWeightModal && (
        <QuickAddWeight
          date={selectedDate}
          onClose={() => {
            setShowWeightModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
