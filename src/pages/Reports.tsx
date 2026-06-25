import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { RDA_VALUES, getMicroProgressColor } from '../lib/nutrition';
import type { FoodConsumptionWithFood,ExerciseRecordWithExercise, WeightRecord } from '../types/database';
import { format, subDays, subMonths, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Calendar, TrendingUp, Apple, Droplets, Dumbbell } from 'lucide-react';

type ReportType = 'weekly' | 'monthly' | 'micronutrients';

interface DayStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
  exerciseCalories: number;
}

interface MicronutrientStats {
  name: string;
  key: string;
  avg7Days: number;
  avg30Days: number;
  rda: number;
  unit: string;
}

export function Reports() {
  const { user, profile, goals } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);
  const [weightData, setWeightData] = useState<WeightRecord[]>([]);
  const [micronutrients, setMicronutrients] = useState<MicronutrientStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user, reportType]);

  const fetchData = async () => {
    if (!user || !profile) return;
    setLoading(true);

    const now = new Date();
    const startDate = reportType === 'weekly' ? subDays(now, 7) : subMonths(now, 1);

    const { data: foodData } = await supabase
      .from('food_consumption')
      .select('amount, consumed_at, food:foods(calories, protein_g, carbs_g, fats_g, fiber_g, vit_a_mcg, vit_b1_mg, vit_b2_mg, vit_b3_mg, vit_b5_mg, vit_b6_mg, vit_b7_mcg, vit_b9_mcg, vit_b12_mcg, vit_c_mg, vit_d_mcg, vit_e_mg, vit_k_mcg, calcium_mg, iron_mg, magnesium_mg, zinc_mg, potassium_mg, phosphorus_mg, selenium_mcg, sodium_mg, copper_mg, manganese_mg, iodine_mcg)')
      .eq('user_id', user.id)
      .gte('consumed_at', startDate.toISOString())
      .order('consumed_at', { ascending: true });

    const { data: exerciseData } = await supabase
      .from('exercise_records')
      .select('calories_burned, performed_at')
      .eq('user_id', user.id)
      .gte('performed_at', startDate.toISOString())
      .order('performed_at', { ascending: true });

    const { data: waterData } = await supabase
      .from('water_consumption')
      .select('amount_ml, consumed_at')
      .eq('user_id', user.id)
      .gte('consumed_at', startDate.toISOString())
      .order('consumed_at', { ascending: true });

    const { data: weightRecords } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', subMonths(now, 3).toISOString())
      .order('recorded_at', { ascending: true });

    const statsByDay: Record<string, DayStats> = {};
    const microByDay: Record<string, Record<string, number>> = {};

    (foodData || []).forEach((item: FoodConsumptionWithFood) => {
      const date = format(parseISO(item.consumed_at), 'yyyy-MM-dd');
      const multiplier = item.amount / 100;

      if (!statsByDay[date]) {
        statsByDay[date] = { date, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, water: 0, exerciseCalories: 0 };
      }
      if (!microByDay[date]) microByDay[date] = {};

      const food = item.food as unknown as Record<string, number>;
      statsByDay[date].calories += (food?.calories || 0) * multiplier;
      statsByDay[date].protein += (food?.protein_g || 0) * multiplier;
      statsByDay[date].carbs += (food?.carbs_g || 0) * multiplier;
      statsByDay[date].fats += (food?.fats_g || 0) * multiplier;
      statsByDay[date].fiber += (food?.fiber_g || 0) * multiplier;

      const microKeys = ['vit_a_mcg', 'vit_b1_mg', 'vit_b2_mg', 'vit_b3_mg', 'vit_b5_mg', 'vit_b6_mg', 'vit_b7_mcg', 'vit_b9_mcg', 'vit_b12_mcg', 'vit_c_mg', 'vit_d_mcg', 'vit_e_mg', 'vit_k_mcg', 'calcium_mg', 'iron_mg', 'magnesium_mg', 'zinc_mg', 'potassium_mg', 'phosphorus_mg', 'selenium_mcg', 'sodium_mg', 'copper_mg', 'manganese_mg', 'iodine_mcg'];
      microKeys.forEach((key) => {
        if (!microByDay[date][key]) microByDay[date][key] = 0;
        microByDay[date][key] += (food?.[key] || 0) * multiplier;
      });
    });

    (exerciseData || []).forEach((item: ExerciseRecordWithExercise) => {
      const date = format(parseISO(item.performed_at), 'yyyy-MM-dd');
      if (!statsByDay[date]) {
        statsByDay[date] = { date, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, water: 0, exerciseCalories: 0 };
      }
      statsByDay[date].exerciseCalories += item.calories_burned;
    });

    (waterData || []).forEach((item) => {
      const date = format(parseISO(item.consumed_at), 'yyyy-MM-dd');
      if (!statsByDay[date]) {
        statsByDay[date] = { date, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, water: 0, exerciseCalories: 0 };
      }
      statsByDay[date].water += item.amount_ml;
    });

    setDailyStats(Object.values(statsByDay));
    setWeightData((weightRecords as WeightRecord[]) || []);

    if (reportType === 'micronutrients') {
      const days7Ago = subDays(now, 7);
      const days30Ago = subDays(now, 30);

      const microNames: Record<string, { name: string; unit: string }> = {
        vit_a_mcg: { name: 'Vitamina A', unit: 'mcg' },
        vit_b1_mg: { name: 'Vitamina B1', unit: 'mg' },
        vit_b2_mg: { name: 'Vitamina B2', unit: 'mg' },
        vit_b3_mg: { name: 'Vitamina B3', unit: 'mg' },
        vit_b5_mg: { name: 'Vitamina B5', unit: 'mg' },
        vit_b6_mg: { name: 'Vitamina B6', unit: 'mg' },
        vit_b7_mcg: { name: 'Vitamina B7', unit: 'mcg' },
        vit_b9_mcg: { name: 'Vitamina B9', unit: 'mcg' },
        vit_b12_mcg: { name: 'Vitamina B12', unit: 'mcg' },
        vit_c_mg: { name: 'Vitamina C', unit: 'mg' },
        vit_d_mcg: { name: 'Vitamina D', unit: 'mcg' },
        vit_e_mg: { name: 'Vitamina E', unit: 'mg' },
        vit_k_mcg: { name: 'Vitamina K', unit: 'mcg' },
        calcium_mg: { name: 'Cálcio', unit: 'mg' },
        iron_mg: { name: 'Ferro', unit: 'mg' },
        magnesium_mg: { name: 'Magnésio', unit: 'mg' },
        zinc_mg: { name: 'Zinco', unit: 'mg' },
        potassium_mg: { name: 'Potássio', unit: 'mg' },
        phosphorus_mg: { name: 'Fósforo', unit: 'mg' },
        selenium_mcg: { name: 'Selênio', unit: 'mcg' },
        sodium_mg: { name: 'Sódio', unit: 'mg' },
        copper_mg: { name: 'Cobre', unit: 'mg' },
        manganese_mg: { name: 'Manganês', unit: 'mg' },
        iodine_mcg: { name: 'Iodo', unit: 'mcg' },
      };

      const rda = RDA_VALUES[profile.sex];

      const microStats: MicronutrientStats[] = Object.keys(microNames).map((key) => {
        const rdaKey = key.replace('_mcg', '').replace('_mg', '').replace('vit_', 'vitamin_') as keyof typeof rda;
        const actualKey = key.startsWith('vit_') ? key.replace('vit_', 'vitamin_') : key;
        const rdaValue = (rda as Record<string, number>)[actualKey] || 100;

        const dates7Days = Object.entries(microByDay).filter(([d]) => parseISO(d) >= days7Ago);
        const dates30Days = Object.entries(microByDay).filter(([d]) => parseISO(d) >= days30Ago);

        const avg7 = dates7Days.length > 0
          ? dates7Days.reduce((sum, [, v]) => sum + (v[key] || 0), 0) / dates7Days.length
          : 0;
        const avg30 = dates30Days.length > 0
          ? dates30Days.reduce((sum, [, v]) => sum + (v[key] || 0), 0) / dates30Days.length
          : 0;

        return {
          name: microNames[key].name,
          key,
          avg7Days: avg7,
          avg30Days: avg30,
          rda: rdaValue,
          unit: microNames[key].unit,
        };
      });

      setMicronutrients(microStats);
    }

    setLoading(false);
  };

  const chartData = dailyStats.map((stat) => ({
    ...stat,
    dateLabel: format(parseISO(stat.date), 'dd/MM', { locale: ptBR }),
  }));

  const weightChartData = weightData.map((w) => ({
    date: format(parseISO(w.recorded_at), 'dd/MM', { locale: ptBR }),
    weight: w.weight_kg,
  }));

  const avgCalories = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, s) => sum + s.calories, 0) / dailyStats.length)
    : 0;
  const avgProtein = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, s) => sum + s.protein, 0) / dailyStats.length)
    : 0;
  const avgCarbs = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, s) => sum + s.carbs, 0) / dailyStats.length)
    : 0;
  const avgFats = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, s) => sum + s.fats, 0) / dailyStats.length)
    : 0;
  const avgWater = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, s) => sum + s.water, 0) / dailyStats.length)
    : 0;

  const totalExerciseCalories = dailyStats.reduce((sum, s) => sum + s.exerciseCalories, 0);
  const totalCaloriesConsumed = dailyStats.reduce((sum, s) => sum + s.calories, 0);
  const netCalories = totalCaloriesConsumed - totalExerciseCalories;

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="p-4 lg:p-6 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Relatórios</h1>

          {/* Report Type Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {[
              { key: 'weekly', label: 'Semanal' },
              { key: 'monthly', label: 'Mensal' },
              { key: 'micronutrients', label: 'Micronutrientes' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setReportType(key as ReportType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  reportType === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reportType === 'micronutrients' ? (
          <div className="space-y-6">
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4">Média de Micronutrientes</h2>
              <p className="text-sm text-secondary-500 mb-4">
                Comparação da média dos últimos 7 e 30 dias com os valores de referência (RDA/DRI)
              </p>

              <div className="space-y-4">
                {micronutrients.map((micro) => {
                  const percent7 = micro.rda > 0 ? (micro.avg7Days / micro.rda) * 100 : 0;
                  const percent30 = micro.rda > 0 ? (micro.avg30Days / micro.rda) * 100 : 0;

                  return (
                    <div key={micro.key} className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-secondary-900 dark:text-white">{micro.name}</span>
                        <span className="text-sm text-secondary-500">
                          RDA: {micro.rda} {micro.unit}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary-500">Média 7 dias</span>
                            <span className="text-secondary-600 dark:text-secondary-400">
                              {micro.avg7Days.toFixed(1)} {micro.unit} ({Math.round(percent7)}%)
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${getMicroProgressColor(percent7)}`}
                              style={{ width: `${Math.min(percent7, 200)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary-500">Média 30 dias</span>
                            <span className="text-secondary-600 dark:text-secondary-400">
                              {micro.avg30Days.toFixed(1)} {micro.unit} ({Math.round(percent30)}%)
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${getMicroProgressColor(percent30)}`}
                              style={{ width: `${Math.min(percent30, 200)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-secondary-500 mb-1">
                  <Apple className="w-4 h-4" />
                  <span className="text-xs">Média Calorias</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{avgCalories}</p>
                <p className="text-xs text-secondary-400">kcal/dia</p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-secondary-500 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs">Média Água</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{Math.round(avgWater / 1000)}</p>
                <p className="text-xs text-secondary-400">L/dia</p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-secondary-500 mb-1">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-xs">Exercício Total</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{Math.round(totalExerciseCalories)}</p>
                <p className="text-xs text-secondary-400">kcal</p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-secondary-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Saldo Calórico</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{Math.round(netCalories)}</p>
                <p className="text-xs text-secondary-400">kcal líquidos</p>
              </div>
            </div>

            {/* Calorie Chart */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4">Evolução Calórica</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dateLabel" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Calorias"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="exerciseCalories"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Exercício"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-secondary-500 py-12">Sem dados suficientes</p>
              )}
            </div>

            {/* Macro Chart */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4">Macronutrientes</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dateLabel" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="protein" fill="#3b82f6" name="Proteína" />
                    <Bar dataKey="carbs" fill="#f59e0b" name="Carboidratos" />
                    <Bar dataKey="fats" fill="#ef4444" name="Gorduras" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-secondary-500 py-12">Sem dados suficientes</p>
              )}
            </div>

            {/* Weight Chart */}
            {weightChartData.length > 0 && (
              <div className="card p-4">
                <h2 className="font-semibold text-secondary-900 dark:text-white mb-4">Evolução do Peso</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Peso (kg)"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Average Summary */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4">Médias do Período</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Calorias', value: avgCalories, unit: 'kcal', target: goals?.calories },
                  { label: 'Proteína', value: avgProtein, unit: 'g', target: goals?.protein_g },
                  { label: 'Carboidratos', value: avgCarbs, unit: 'g', target: goals?.carbs_g },
                  { label: 'Gorduras', value: avgFats, unit: 'g', target: goals?.fats_g },
                  { label: 'Água', value: Math.round(avgWater), unit: 'ml', target: goals?.water_ml },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <p className="text-xs text-secondary-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-secondary-400">
                      {stat.target ? `de ${Math.round(stat.target)} ${stat.unit}` : stat.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
