-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (user setup data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  birthdate DATE NOT NULL,
  height_cm DECIMAL(5,2) NOT NULL,
  current_weight_kg DECIMAL(5,2) NOT NULL,
  target_weight_kg DECIMAL(5,2) NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  goal TEXT NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
  setup_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User goals (can be auto-calculated or manually set)
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  calories DECIMAL(7,2),
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fats_g DECIMAL(6,2),
  fiber_g DECIMAL(5,2),
  water_ml DECIMAL(6,2),
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Weight tracking
CREATE TABLE weight_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recorded_at)
);

-- Food database
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  serving_unit TEXT DEFAULT 'g',
  serving_size DECIMAL(6,2) DEFAULT 100,
  calories DECIMAL(7,2) NOT NULL,
  protein_g DECIMAL(6,2) DEFAULT 0,
  carbs_g DECIMAL(6,2) DEFAULT 0,
  fats_g DECIMAL(6,2) DEFAULT 0,
  fiber_g DECIMAL(5,2) DEFAULT 0,
  -- Vitamins (per 100g)
  vit_a_mcg DECIMAL(7,2) DEFAULT 0,
  vit_b1_mg DECIMAL(6,2) DEFAULT 0,
  vit_b2_mg DECIMAL(6,2) DEFAULT 0,
  vit_b3_mg DECIMAL(6,2) DEFAULT 0,
  vit_b5_mg DECIMAL(6,2) DEFAULT 0,
  vit_b6_mg DECIMAL(6,2) DEFAULT 0,
  vit_b7_mcg DECIMAL(6,2) DEFAULT 0,
  vit_b9_mcg DECIMAL(6,2) DEFAULT 0,
  vit_b12_mcg DECIMAL(6,2) DEFAULT 0,
  vit_c_mg DECIMAL(6,2) DEFAULT 0,
  vit_d_mcg DECIMAL(6,2) DEFAULT 0,
  vit_e_mg DECIMAL(6,2) DEFAULT 0,
  vit_k_mcg DECIMAL(6,2) DEFAULT 0,
  -- Minerals (per 100g)
  calcium_mg DECIMAL(6,2) DEFAULT 0,
  iron_mg DECIMAL(6,2) DEFAULT 0,
  magnesium_mg DECIMAL(6,2) DEFAULT 0,
  zinc_mg DECIMAL(6,2) DEFAULT 0,
  potassium_mg DECIMAL(7,2) DEFAULT 0,
  phosphorus_mg DECIMAL(6,2) DEFAULT 0,
  selenium_mcg DECIMAL(6,2) DEFAULT 0,
  sodium_mg DECIMAL(6,2) DEFAULT 0,
  copper_mg DECIMAL(6,2) DEFAULT 0,
  manganese_mg DECIMAL(6,2) DEFAULT 0,
  iodine_mcg DECIMAL(6,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Food favorites
CREATE TABLE food_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, food_id)
);

-- Food consumption records
CREATE TABLE food_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(7,2) NOT NULL,
  consumed_at TIMESTAMPTZ DEFAULT now(),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exercise database
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories_per_min DECIMAL(6,2) NOT NULL,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exercise records
CREATE TABLE exercise_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  duration_min INTEGER NOT NULL,
  calories_burned DECIMAL(7,2) NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Water consumption
CREATE TABLE water_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml DECIMAL(6,2) NOT NULL,
  consumed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_consumption ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS Policies for user_goals
CREATE POLICY "select_own_goals" ON user_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_goals" ON user_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_goals" ON user_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_goals" ON user_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for weight_records
CREATE POLICY "select_own_weights" ON weight_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_weights" ON weight_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_weights" ON weight_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_weights" ON weight_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for foods (users can see their own and public foods)
CREATE POLICY "select_foods" ON foods FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "insert_own_foods" ON foods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_foods" ON foods FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_foods" ON foods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for food_favorites
CREATE POLICY "select_own_favorites" ON food_favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_favorites" ON food_favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_favorites" ON food_favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for food_consumption
CREATE POLICY "select_own_consumption" ON food_consumption FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_consumption" ON food_consumption FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_consumption" ON food_consumption FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for exercises (users can see their own and public exercises)
CREATE POLICY "select_exercises" ON exercises FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "insert_own_exercises" ON exercises FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_exercises" ON exercises FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_exercises" ON exercises FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for exercise_records
CREATE POLICY "select_own_exercise_records" ON exercise_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_exercise_records" ON exercise_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_exercise_records" ON exercise_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for water_consumption
CREATE POLICY "select_own_water" ON water_consumption FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_water" ON water_consumption FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_water" ON water_consumption FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_profiles_user ON profiles(id);
CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_weight_records_user ON weight_records(user_id, recorded_at DESC);
CREATE INDEX idx_foods_user ON foods(user_id);
CREATE INDEX idx_foods_public ON foods(is_public) WHERE is_public = true;
CREATE INDEX idx_food_favorites_user ON food_favorites(user_id);
CREATE INDEX idx_food_consumption_user ON food_consumption(user_id, consumed_at DESC);
CREATE INDEX idx_exercises_user ON exercises(user_id);
CREATE INDEX idx_exercise_records_user ON exercise_records(user_id, performed_at DESC);
CREATE INDEX idx_water_consumption_user ON water_consumption(user_id, consumed_at DESC);