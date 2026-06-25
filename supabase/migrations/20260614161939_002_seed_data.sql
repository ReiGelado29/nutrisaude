-- Insert default public foods
INSERT INTO foods (name, category, calories, protein_g, carbs_g, fats_g, fiber_g, is_public, user_id) VALUES
-- Proteins
('Chicken Breast', 'Proteins', 165, 31, 0, 3.6, 0, true, null),
('Egg', 'Proteins', 155, 13, 1.1, 11, 0, true, null),
('Beef Steak', 'Proteins', 271, 26, 0, 18, 0, true, null),
('Salmon', 'Proteins', 208, 20, 0, 13, 0, true, null),
('Tuna (canned)', 'Proteins', 116, 26, 0, 1, 0, true, null),
('Shrimp', 'Proteins', 99, 24, 0.2, 0.3, 0, true, null),
-- Carbs
('White Rice (cooked)', 'Carbohydrates', 130, 2.7, 28, 0.3, 0.4, true, null),
('Brown Rice (cooked)', 'Carbohydrates', 111, 2.6, 23, 0.9, 1.8, true, null),
('Pasta (cooked)', 'Carbohydrates', 131, 5, 25, 1.1, 1.8, true, null),
('Bread (white)', 'Carbohydrates', 265, 9, 49, 3.2, 2.7, true, null),
('Bread (whole wheat)', 'Carbohydrates', 247, 13, 41, 3.4, 7, true, null),
('Oatmeal', 'Carbohydrates', 68, 2.4, 12, 1.4, 1.7, true, null),
('Banana', 'Fruits', 89, 1.1, 23, 0.3, 2.6, true, null),
('Apple', 'Fruits', 52, 0.3, 14, 0.2, 2.4, true, null),
('Orange', 'Fruits', 47, 0.9, 12, 0.1, 2.4, true, null),
('Strawberries', 'Fruits', 32, 0.7, 7.7, 0.3, 2, true, null),
('Avocado', 'Fruits', 160, 2, 8.5, 15, 6.7, true, null),
-- Vegetables
('Broccoli', 'Vegetables', 34, 2.8, 7, 0.4, 2.6, true, null),
('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, true, null),
('Carrot', 'Vegetables', 41, 0.9, 10, 0.2, 2.8, true, null),
('Tomato', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, true, null),
('Potato', 'Vegetables', 77, 2, 17, 0.1, 2.2, true, null),
('Sweet Potato', 'Vegetables', 86, 1.6, 20, 0.1, 3, true, null),
-- Dairy
('Milk (whole)', 'Dairy', 61, 3.2, 4.8, 3.3, 0, true, null),
('Greek Yogurt', 'Dairy', 97, 9, 4, 5, 0, true, null),
('Cheese (Cheddar)', 'Dairy', 403, 25, 1.3, 33, 0, true, null),
('Cottage Cheese', 'Dairy', 98, 11, 3.4, 4.3, 0, true, null),
-- Nuts & Seeds
('Almonds', 'Nuts & Seeds', 579, 21, 22, 50, 12.5, true, null),
('Walnuts', 'Nuts & Seeds', 654, 15, 14, 65, 6.7, true, null),
('Peanut Butter', 'Nuts & Seeds', 588, 25, 20, 50, 6, true, null),
-- Legumes
('Black Beans', 'Legumes', 132, 8.9, 24, 0.5, 8.7, true, null),
('Lentils', 'Legumes', 116, 9, 20, 0.4, 7.9, true, null),
('Chickpeas', 'Legumes', 164, 8.9, 27, 2.6, 7.6, true, null);

-- Insert default public exercises
INSERT INTO exercises (name, calories_per_min, category, is_public, user_id) VALUES
-- Cardio
('Walking (moderate)', 4, 'Cardio', true, null),
('Walking (brisk)', 5.5, 'Cardio', true, null),
('Running (5 mph)', 10, 'Cardio', true, null),
('Running (6 mph)', 12, 'Cardio', true, null),
('Running (7.5 mph)', 14, 'Cardio', true, null),
('Cycling (moderate)', 7, 'Cardio', true, null),
('Cycling (vigorous)', 12, 'Cardio', true, null),
('Swimming (leisure)', 6, 'Cardio', true, null),
('Swimming (laps)', 10, 'Cardio', true, null),
('Jumping Rope', 12, 'Cardio', true, null),
('Rowing Machine', 9, 'Cardio', true, null),
('Elliptical', 8, 'Cardio', true, null),
('Stair Climbing', 9, 'Cardio', true, null),
('Dancing', 5.5, 'Cardio', true, null),
('Hiking', 7, 'Cardio', true, null),
-- Strength
('Weight Lifting (light)', 4, 'Strength', true, null),
('Weight Lifting (vigorous)', 6, 'Strength', true, null),
('Push-ups', 7, 'Strength', true, null),
('Pull-ups', 8, 'Strength', true, null),
('Squats', 6, 'Strength', true, null),
('Lunges', 5.5, 'Strength', true, null),
('Plank', 4, 'Strength', true, null),
('Crunches', 4, 'Strength', true, null),
('Burpees', 10, 'Strength', true, null),
-- Sports
('Basketball', 8, 'Sports', true, null),
('Soccer', 10, 'Sports', true, null),
('Tennis', 8, 'Sports', true, null),
('Volleyball', 5, 'Sports', true, null),
('Boxing', 12, 'Sports', true, null),
('Yoga', 3, 'Flexibility', true, null),
('Pilates', 4, 'Flexibility', true, null),
('Stretching', 2.5, 'Flexibility', true, null);