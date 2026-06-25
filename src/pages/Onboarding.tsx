import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateAllGoals, ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from '../lib/nutrition';
import { ProfileInsert, ActivityLevel, Goal, Sex } from '../types/database';
import { ChevronRight, ChevronLeft, User, Ruler, Scale, Activity, Target, Check } from 'lucide-react';
import { Loading } from '../components/Loading';

const STEPS = ['Personal', 'Medidas', 'Atividade', 'Objetivo', 'Resumo'];

export function Onboarding() {
  const { user, refreshProfile, refreshGoals } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<ProfileInsert, 'id'>>({
    id: user!.id,
    name: '',
    sex: 'male',
    birthdate: '',
    height_cm: 0,
    current_weight_kg: 0,
    target_weight_kg: 0,
    activity_level: 'sedentary',
    goal: 'maintain',
    setup_completed: false,
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.name && formData.sex && formData.birthdate;
      case 1:
        return formData.height_cm > 0 && formData.current_weight_kg > 0 && formData.target_weight_kg > 0;
      case 2:
        return formData.activity_level;
      case 3:
        return formData.goal;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const goals = calculateAllGoals({
        ...formData,
        id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ProfileInsert);

      const { error: profileError } = await supabase.from('profiles').insert({
        ...formData,
        setup_completed: true,
      });

      if (profileError) throw profileError;

      const { error: goalsError } = await supabase.from('user_goals').insert({
        user_id: user.id,
        calories: goals.calories,
        protein_g: goals.protein_g,
        carbs_g: goals.carbs_g,
        fats_g: goals.fats_g,
        fiber_g: goals.fiber_g,
        water_ml: goals.water_ml,
        is_manual: false,
      });

      if (goalsError) throw goalsError;

      await refreshProfile();
      await refreshGoals();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Salvando suas configurações..." />;
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Seu nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="input"
                placeholder="Como podemos te chamar?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                Sexo biológico
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as Sex[]).map((sex) => (
                  <button
                    key={sex}
                    type="button"
                    onClick={() => updateFormData({ sex })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.sex === sex
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {sex === 'male' ? 'Masculino' : 'Feminino'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Data de nascimento
              </label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => updateFormData({ birthdate: e.target.value })}
                className="input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                value={formData.height_cm || ''}
                onChange={(e) => updateFormData({ height_cm: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="170"
                min={100}
                max={250}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Peso atual (kg)
              </label>
              <input
                type="number"
                value={formData.current_weight_kg || ''}
                onChange={(e) => updateFormData({ current_weight_kg: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="75.5"
                min={30}
                max={300}
                step={0.1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Peso meta (kg)
              </label>
              <input
                type="number"
                value={formData.target_weight_kg || ''}
                onChange={(e) => updateFormData({ target_weight_kg: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="70"
                min={30}
                max={300}
                step={0.1}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 animate-fade-in">
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Qual é o seu nível de atividade física atual?
            </p>
            {(
              [
                'sedentary',
                'lightly_active',
                'moderately_active',
                'very_active',
                'extremely_active',
              ] as ActivityLevel[]
            ).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateFormData({ activity_level: level })}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.activity_level === level
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                }`}
              >
                <p className="font-medium text-secondary-900 dark:text-white">
                  {ACTIVITY_LEVEL_LABELS[level]}
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  {level === 'sedentary' && 'Pouco ou nenhum exercício'}
                  {level === 'lightly_active' && 'Exercício leve 1-3 dias/semana'}
                  {level === 'moderately_active' && 'Exercício moderado 3-5 dias/semana'}
                  {level === 'very_active' && 'Exercício intenso 6-7 dias/semana'}
                  {level === 'extremely_active' && 'Exercício muito intenso + trabalho físico'}
                </p>
              </button>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 animate-fade-in">
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Qual é o seu objetivo principal?
            </p>
            {(['lose', 'maintain', 'gain'] as Goal[]).map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => updateFormData({ goal })}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.goal === goal
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                }`}
              >
                <p className="font-medium text-secondary-900 dark:text-white">
                  {GOAL_LABELS[goal]}
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  {goal === 'lose' && 'Reduzir gordura corporal com déficit calórico'}
                  {goal === 'maintain' && 'Manter o peso atual'}
                  {goal === 'gain' && 'Ganhar massa muscular com superávit calórico'}
                </p>
              </button>
            ))}
          </div>
        );

      case 4:
        const goals = calculateAllGoals({
          ...formData,
          id: user!.id,
          created_at: '',
          updated_at: '',
        } as ProfileInsert);

        return (
          <div className="space-y-6 animate-fade-in">
            <p className="text-secondary-600 dark:text-secondary-400">
              Aqui está um resumo das suas metas diárias calculadas:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Calorias', value: `${goals.calories} kcal` },
                { label: 'Proteínas', value: `${goals.protein_g}g` },
                { label: 'Carboidratos', value: `${goals.carbs_g}g` },
                { label: 'Gorduras', value: `${goals.fats_g}g` },
                { label: 'Fibras', value: `${goals.fiber_g}g` },
                { label: 'Água', value: `${Math.round(goals.water_ml / 1000)}L` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-secondary-100 dark:bg-secondary-700"
                >
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">{item.label}</p>
                  <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Estas metas podem ser ajustadas posteriormente nas configurações.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepIcons = [User, Ruler, Activity, Target, Check];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col">
      {/* Progress Header */}
      <div className="p-4 lg:p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i <= step
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-400'
                  }`}
                >
                  {i < step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    (() => {
                      const Icon = stepIcons[i];
                      return <Icon className="w-5 h-5" />;
                    })()
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-6 lg:w-12 h-1 rounded-full transition-all duration-300 ${
                      i < step ? 'bg-primary-500' : 'bg-secondary-200 dark:bg-secondary-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-secondary-500">
            Passo {step + 1} de {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-md mx-auto card p-6 lg:p-8">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">
            {STEPS[step]}
          </h2>
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 lg:p-6">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary flex-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="btn-primary flex-1"
            >
              Começar
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
