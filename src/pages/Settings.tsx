import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateAllGoals, ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from '../lib/nutrition';
import type { ProfileUpdate, UserGoalsUpdate, ActivityLevel, Goal, Sex } from '../types/database';
import { User, Scale, Activity, Target, Save, Loader2, Check } from 'lucide-react';

export function Settings() {
  const { user, profile, goals, refreshProfile, refreshGoals } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'goals'>('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    sex: 'male' as Sex,
    birthdate: '',
    height_cm: 0,
    current_weight_kg: 0,
    target_weight_kg: 0,
    activity_level: 'sedentary' as ActivityLevel,
    goal: 'maintain' as Goal,
  });

  const [goalsForm, setGoalsForm] = useState({
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
    fiber_g: 0,
    water_ml: 0,
    is_manual: false,
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        sex: profile.sex,
        birthdate: profile.birthdate,
        height_cm: profile.height_cm,
        current_weight_kg: profile.current_weight_kg,
        target_weight_kg: profile.target_weight_kg,
        activity_level: profile.activity_level,
        goal: profile.goal,
      });
    }
    if (goals) {
      setGoalsForm({
        calories: goals.calories || 0,
        protein_g: goals.protein_g || 0,
        carbs_g: goals.carbs_g || 0,
        fats_g: goals.fats_g || 0,
        fiber_g: goals.fiber_g || 0,
        water_ml: goals.water_ml || 0,
        is_manual: goals.is_manual,
      });
    }
  }, [profile, goals]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);

    const update: ProfileUpdate = {
      name: profileForm.name,
      sex: profileForm.sex,
      birthdate: profileForm.birthdate,
      height_cm: profileForm.height_cm,
      current_weight_kg: profileForm.current_weight_kg,
      target_weight_kg: profileForm.target_weight_kg,
      activity_level: profileForm.activity_level,
      goal: profileForm.goal,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').update(update).eq('id', user.id);

    if (!error) {
      if (!goalsForm.is_manual && profile) {
        const newGoals = calculateAllGoals({ ...profile, ...update } as ProfileUpdate & { id: string; birthdate: string; created_at: string; updated_at: string; setup_completed: boolean });
        await supabase.from('user_goals').update({
          calories: newGoals.calories,
          protein_g: newGoals.protein_g,
          carbs_g: newGoals.carbs_g,
          fats_g: newGoals.fats_g,
          fiber_g: newGoals.fiber_g,
          water_ml: newGoals.water_ml,
          is_manual: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
      }
      await refreshProfile();
      await refreshGoals();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setLoading(false);
  };

  const handleSaveGoals = async () => {
    if (!user) return;
    setLoading(true);

    const update: UserGoalsUpdate = {
      calories: goalsForm.calories,
      protein_g: goalsForm.protein_g,
      carbs_g: goalsForm.carbs_g,
      fats_g: goalsForm.fats_g,
      fiber_g: goalsForm.fiber_g,
      water_ml: goalsForm.water_ml,
      is_manual: goalsForm.is_manual,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('user_goals').update(update).eq('user_id', user.id);

    if (!error) {
      await refreshGoals();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setLoading(false);
  };

  const recalculateGoals = () => {
    if (!profile) return;
    const newGoals = calculateAllGoals({
      ...profile,
      current_weight_kg: profileForm.current_weight_kg,
      activity_level: profileForm.activity_level,
      goal: profileForm.goal,
    } as ProfileUpdate & { id: string; birthdate: string; created_at: string; updated_at: string; setup_completed: boolean; sex: Sex });
    setGoalsForm({
      ...goalsForm,
      calories: newGoals.calories,
      protein_g: newGoals.protein_g,
      carbs_g: newGoals.carbs_g,
      fats_g: newGoals.fats_g,
      fiber_g: newGoals.fiber_g,
      water_ml: newGoals.water_ml,
      is_manual: false,
    });
  };

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="p-4 lg:p-6 lg:pt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Configurações</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'goals'
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Metas
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 lg:px-6">
        {activeTab === 'profile' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Personal Info */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Informações Pessoais
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Sexo biológico
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as Sex[]).map((sex) => (
                      <button
                        key={sex}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, sex })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          profileForm.sex === sex
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-secondary-200 dark:border-secondary-700'
                        }`}
                      >
                        <span className="font-medium text-secondary-900 dark:text-white">
                          {sex === 'male' ? 'Masculino' : 'Feminino'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    value={profileForm.birthdate}
                    onChange={(e) => setProfileForm({ ...profileForm, birthdate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-accent-500" />
                Medidas
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={profileForm.height_cm || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, height_cm: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min={100}
                    max={250}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Peso atual (kg)
                  </label>
                  <input
                    type="number"
                    value={profileForm.current_weight_kg || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, current_weight_kg: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min={30}
                    max={300}
                    step={0.1}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Peso meta (kg)
                  </label>
                  <input
                    type="number"
                    value={profileForm.target_weight_kg || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, target_weight_kg: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min={30}
                    max={300}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Nível de Atividade
              </h2>

              <div className="space-y-2">
                {(
                  ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'] as ActivityLevel[]
                ).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, activity_level: level })}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      profileForm.activity_level === level
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700'
                    }`}
                  >
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {ACTIVITY_LEVEL_LABELS[level]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="card p-4">
              <h2 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                Objetivo
              </h2>

              <div className="space-y-2">
                {(['lose', 'maintain', 'gain'] as Goal[]).map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, goal })}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      profileForm.goal === goal
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700'
                    }`}
                  >
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {GOAL_LABELS[goal]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button onClick={handleSaveProfile} disabled={loading} className="btn-primary w-full">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                 Salvar Alterações
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Goals */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-secondary-900 dark:text-white">Metas Diárias</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={goalsForm.is_manual}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        recalculateGoals();
                      }
                      setGoalsForm({ ...goalsForm, is_manual: e.target.checked });
                    }}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Manual</span>
                </label>
              </div>

              {!goalsForm.is_manual && (
                <p className="text-sm text-secondary-500 mb-4">
                  As metas são calculadas automaticamente com base no seu perfil. Ative o modo manual para personalizar.
                </p>
              )}

              <div className="space-y-4">
                {[
                  { key: 'calories', label: 'Calorias', unit: 'kcal' },
                  { key: 'protein_g', label: 'Proteína', unit: 'g' },
                  { key: 'carbs_g', label: 'Carboidratos', unit: 'g' },
                  { key: 'fats_g', label: 'Gorduras', unit: 'g' },
                  { key: 'fiber_g', label: 'Fibras', unit: 'g' },
                  { key: 'water_ml', label: 'Água', unit: 'ml' },
                ].map(({ key, label, unit }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      {label} ({unit})
                    </label>
                    <input
                      type="number"
                      value={goalsForm[key as keyof typeof goalsForm] || ''}
                      onChange={(e) => setGoalsForm({ ...goalsForm, [key]: parseFloat(e.target.value) || 0 })}
                      className="input"
                      disabled={!goalsForm.is_manual}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Recalculate Button */}
            {!goalsForm.is_manual && (
              <button onClick={recalculateGoals} className="btn-secondary w-full">
                Recalcular Metas
              </button>
            )}

            {/* Save Button */}
            <button onClick={handleSaveGoals} disabled={loading} className="btn-primary w-full">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Metas
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
