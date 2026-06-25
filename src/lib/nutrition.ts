import { ActivityLevel, Goal, Sex, Profile } from '../types/database';

// Activity factors
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.20,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.90,
};

// RDA/DRI reference values for adults
export const RDA_VALUES = {
  male: {
    vitamin_a_mcg: 900,
    vitamin_b1_mg: 1.2,
    vitamin_b2_mg: 1.3,
    vitamin_b3_mg: 16,
    vitamin_b5_mg: 5,
    vitamin_b6_mg: 1.3,
    vitamin_b7_mcg: 30,
    vitamin_b9_mcg: 400,
    vitamin_b12_mcg: 2.4,
    vitamin_c_mg: 90,
    vitamin_d_mcg: 15,
    vitamin_e_mg: 15,
    vitamin_k_mcg: 120,
    calcium_mg: 1000,
    iron_mg: 8,
    magnesium_mg: 400,
    zinc_mg: 11,
    potassium_mg: 3400,
    phosphorus_mg: 700,
    selenium_mcg: 55,
    sodium_mg: 1500,
    copper_mg: 0.9,
    manganese_mg: 2.3,
    iodine_mcg: 150,
  },
  female: {
    vitamin_a_mcg: 700,
    vitamin_b1_mg: 1.1,
    vitamin_b2_mg: 1.1,
    vitamin_b3_mg: 14,
    vitamin_b5_mg: 5,
    vitamin_b6_mg: 1.3,
    vitamin_b7_mcg: 30,
    vitamin_b9_mcg: 400,
    vitamin_b12_mcg: 2.4,
    vitamin_c_mg: 75,
    vitamin_d_mcg: 15,
    vitamin_e_mg: 15,
    vitamin_k_mcg: 90,
    calcium_mg: 1000,
    iron_mg: 18,
    magnesium_mg: 310,
    zinc_mg: 8,
    potassium_mg: 2600,
    phosphorus_mg: 700,
    selenium_mcg: 55,
    sodium_mg: 1500,
    copper_mg: 0.9,
    manganese_mg: 1.8,
    iodine_mcg: 150,
  },
};

export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function calculateTMB(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateGET(tmb: number, activityLevel: ActivityLevel): number {
  return tmb * ACTIVITY_FACTORS[activityLevel];
}

export function calculateCalorieGoal(get: number, goal: Goal): number {
  switch (goal) {
    case 'lose':
      return get - 500;
    case 'maintain':
      return get;
    case 'gain':
      return get + 300;
  }
}

export function calculateProteinGoal(weightKg: number): number {
  return weightKg * 2.0;
}

export function calculateFatGoal(weightKg: number): number {
  return weightKg * 0.8;
}

export function calculateFiberGoal(sex: Sex): number {
  return sex === 'male' ? 38 : 25;
}

export function calculateCarbsGoal(calorieGoal: number, proteinG: number, fatG: number): number {
  const proteinCalories = proteinG * 4;
  const fatCalories = fatG * 9;
  const remainingCalories = calorieGoal - proteinCalories - fatCalories;
  return Math.max(0, remainingCalories / 4);
}

export function calculateWaterGoal(weightKg: number): number {
  return weightKg * 35;
}

export function calculateAllGoals(profile: Profile) {
  const age = calculateAge(profile.birthdate);
  const tmb = calculateTMB(profile.current_weight_kg, profile.height_cm, age, profile.sex);
  const get = calculateGET(tmb, profile.activity_level);
  const calorieGoal = calculateCalorieGoal(get, profile.goal);
  const proteinGoal = calculateProteinGoal(profile.current_weight_kg);
  const fatGoal = calculateFatGoal(profile.current_weight_kg);
  const fiberGoal = calculateFiberGoal(profile.sex);
  const carbsGoal = calculateCarbsGoal(calorieGoal, proteinGoal, fatGoal);
  const waterGoal = calculateWaterGoal(profile.current_weight_kg);

  return {
    tmb,
    get,
    calories: Math.round(calorieGoal),
    protein_g: Math.round(proteinGoal),
    carbs_g: Math.round(carbsGoal),
    fats_g: Math.round(fatGoal),
    fiber_g: fiberGoal,
    water_ml: Math.round(waterGoal),
  };
}

export function calculateEstimatedWeightChange(calorieDeficit: number): number {
  // 7700 kcal = 1 kg of fat
  return calorieDeficit / 7700;
}

export function getProgressColor(percentage: number): string {
  if (percentage < 80) return 'bg-red-500';
  if (percentage < 100) return 'bg-yellow-500';
  if (percentage <= 110) return 'bg-green-500';
  return 'bg-blue-500';
}

export function getMicroProgressColor(percentage: number): string {
  if (percentage < 70) return 'bg-red-500';
  if (percentage < 100) return 'bg-yellow-500';
  if (percentage <= 150) return 'bg-green-500';
  return 'bg-blue-500';
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentário',
  lightly_active: 'Levemente Ativo',
  moderately_active: 'Moderadamente Ativo',
  very_active: 'Muito Ativo',
  extremely_active: 'Extremamente Ativo',
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: 'Emagrecer',
  maintain: 'Manter Peso',
  gain: 'Ganhar Massa',
};

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
  other: 'Outro',
};
