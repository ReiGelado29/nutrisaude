export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          sex: 'male' | 'female';
          birthdate: string;
          height_cm: number;
          current_weight_kg: number;
          target_weight_kg: number;
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
          goal: 'lose' | 'maintain' | 'gain';
          setup_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          sex: 'male' | 'female';
          birthdate: string;
          height_cm: number;
          current_weight_kg: number;
          target_weight_kg: number;
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
          goal: 'lose' | 'maintain' | 'gain';
          setup_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sex?: 'male' | 'female';
          birthdate?: string;
          height_cm?: number;
          current_weight_kg?: number;
          target_weight_kg?: number;
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
          goal?: 'lose' | 'maintain' | 'gain';
          setup_completed?: boolean;
          updated_at?: string;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fats_g: number | null;
          fiber_g: number | null;
          water_ml: number | null;
          is_manual: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fats_g?: number | null;
          fiber_g?: number | null;
          water_ml?: number | null;
          is_manual?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fats_g?: number | null;
          fiber_g?: number | null;
          water_ml?: number | null;
          is_manual?: boolean;
          updated_at?: string;
        };
      };
      weight_records: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          weight_kg?: number;
          recorded_at?: string;
        };
      };
      foods: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          category: string | null;
          serving_unit: string;
          serving_size: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fats_g: number;
          fiber_g: number;
          vit_a_mcg: number;
          vit_b1_mg: number;
          vit_b2_mg: number;
          vit_b3_mg: number;
          vit_b5_mg: number;
          vit_b6_mg: number;
          vit_b7_mcg: number;
          vit_b9_mcg: number;
          vit_b12_mcg: number;
          vit_c_mg: number;
          vit_d_mcg: number;
          vit_e_mg: number;
          vit_k_mcg: number;
          calcium_mg: number;
          iron_mg: number;
          magnesium_mg: number;
          zinc_mg: number;
          potassium_mg: number;
          phosphorus_mg: number;
          selenium_mcg: number;
          sodium_mg: number;
          copper_mg: number;
          manganese_mg: number;
          iodine_mcg: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          category?: string | null;
          serving_unit?: string;
          serving_size?: number;
          calories: number;
          protein_g?: number;
          carbs_g?: number;
          fats_g?: number;
          fiber_g?: number;
          vit_a_mcg?: number;
          vit_b1_mg?: number;
          vit_b2_mg?: number;
          vit_b3_mg?: number;
          vit_b5_mg?: number;
          vit_b6_mg?: number;
          vit_b7_mcg?: number;
          vit_b9_mcg?: number;
          vit_b12_mcg?: number;
          vit_c_mg?: number;
          vit_d_mcg?: number;
          vit_e_mg?: number;
          vit_k_mcg?: number;
          calcium_mg?: number;
          iron_mg?: number;
          magnesium_mg?: number;
          zinc_mg?: number;
          potassium_mg?: number;
          phosphorus_mg?: number;
          selenium_mcg?: number;
          sodium_mg?: number;
          copper_mg?: number;
          manganese_mg?: number;
          iodine_mcg?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<FoodInsert>;
      };
      food_favorites: {
        Row: {
          id: string;
          user_id: string;
          food_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_id: string;
          created_at?: string;
        };
      };
      food_consumption: {
        Row: {
          id: string;
          user_id: string;
          food_id: string;
          amount: number;
          consumed_at: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_id: string;
          amount: number;
          consumed_at?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null;
          created_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          calories_per_min: number;
          category: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          calories_per_min: number;
          category?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ExerciseInsert>;
      };
      exercise_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          duration_min: number;
          calories_burned: number;
          performed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          duration_min: number;
          calories_burned: number;
          performed_at?: string;
          created_at?: string;
        };
      };
      water_consumption: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          consumed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          consumed_at?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type UserGoals = Database['public']['Tables']['user_goals']['Row'];
export type UserGoalsInsert = Database['public']['Tables']['user_goals']['Insert'];
export type UserGoalsUpdate = Database['public']['Tables']['user_goals']['Update'];

export type WeightRecord = Database['public']['Tables']['weight_records']['Row'];
export type WeightRecordInsert = Database['public']['Tables']['weight_records']['Insert'];

export type Food = Database['public']['Tables']['foods']['Row'];
export type FoodInsert = Database['public']['Tables']['foods']['Insert'];

export type FoodFavorite = Database['public']['Tables']['food_favorites']['Row'];
export type FoodFavoriteInsert = Database['public']['Tables']['food_favorites']['Insert'];

export type FoodConsumption = Database['public']['Tables']['food_consumption']['Row'];
export type FoodConsumptionInsert = Database['public']['Tables']['food_consumption']['Insert'];

export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];

export type ExerciseRecord = Database['public']['Tables']['exercise_records']['Row'];
export type ExerciseRecordInsert = Database['public']['Tables']['exercise_records']['Insert'];

export type WaterConsumption = Database['public']['Tables']['water_consumption']['Row'];
export type WaterConsumptionInsert = Database['public']['Tables']['water_consumption']['Insert'];

export interface FoodWithFavorite extends Food {
  is_favorite?: boolean;
}

export interface FoodConsumptionWithFood extends FoodConsumption {
  food: Food;
}

export interface ExerciseRecordWithExercise extends ExerciseRecord {
  exercise: Exercise;
}

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Sex = 'male' | 'female';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
