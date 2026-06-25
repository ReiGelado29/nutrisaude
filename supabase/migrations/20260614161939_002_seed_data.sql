-- Insert default public foods
INSERT INTO foods (name, category, calories, protein_g, carbs_g, fats_g, fiber_g, is_public, user_id) VALUES

-- PROTEÍNAS
('Peito de Frango Grelhado', 'Proteínas', 165, 31, 0, 3.6, 0, true, null),
('Ovo Inteiro', 'Proteínas', 155, 13, 1.1, 11, 0, true, null),
('Patinho Bovino', 'Proteínas', 219, 35, 0, 8, 0, true, null),
('Alcatra', 'Proteínas', 240, 32, 0, 12, 0, true, null),
('Atum em Água', 'Proteínas', 116, 26, 0, 1, 0, true, null),
('Salmão', 'Proteínas', 208, 20, 0, 13, 0, true, null),
('Tilápia', 'Proteínas', 129, 26, 0, 2.7, 0, true, null),
('Camarão', 'Proteínas', 99, 24, 0.2, 0.3, 0, true, null),

-- CARBOIDRATOS
('Arroz Branco Cozido', 'Carboidratos', 130, 2.7, 28, 0.3, 0.4, true, null),
('Arroz Integral Cozido', 'Carboidratos', 111, 2.6, 23, 0.9, 1.8, true, null),
('Macarrão Cozido', 'Carboidratos', 131, 5, 25, 1.1, 1.8, true, null),
('Pão Francês', 'Carboidratos', 300, 8, 58, 3, 2.3, true, null),
('Pão Integral', 'Carboidratos', 247, 13, 41, 3.4, 7, true, null),
('Aveia', 'Carboidratos', 389, 17, 66, 7, 10, true, null),
('Batata Inglesa Cozida', 'Carboidratos', 77, 2, 17, 0.1, 2.2, true, null),
('Batata Doce Cozida', 'Carboidratos', 86, 1.6, 20, 0.1, 3, true, null),
('Mandioca Cozida', 'Carboidratos', 125, 1, 30, 0.3, 1.6, true, null),
('Tapioca', 'Carboidratos', 330, 0.2, 82, 0.1, 0, true, null),

-- FRUTAS
('Banana', 'Frutas', 89, 1.1, 23, 0.3, 2.6, true, null),
('Maçã', 'Frutas', 52, 0.3, 14, 0.2, 2.4, true, null),
('Laranja', 'Frutas', 47, 0.9, 12, 0.1, 2.4, true, null),
('Morango', 'Frutas', 32, 0.7, 7.7, 0.3, 2, true, null),
('Abacate', 'Frutas', 160, 2, 8.5, 15, 6.7, true, null),
('Mamão', 'Frutas', 43, 0.5, 11, 0.3, 1.8, true, null),
('Melancia', 'Frutas', 30, 0.6, 8, 0.2, 0.4, true, null),

-- LEGUMES E VERDURAS
('Brócolis', 'Vegetais', 34, 2.8, 7, 0.4, 2.6, true, null),
('Espinafre', 'Vegetais', 23, 2.9, 3.6, 0.4, 2.2, true, null),
('Cenoura', 'Vegetais', 41, 0.9, 10, 0.2, 2.8, true, null),
('Tomate', 'Vegetais', 18, 0.9, 3.9, 0.2, 1.2, true, null),
('Alface', 'Vegetais', 15, 1.4, 2.9, 0.2, 1.3, true, null),
('Pepino', 'Vegetais', 15, 0.7, 3.6, 0.1, 0.5, true, null),

-- LATICÍNIOS
('Leite Integral', 'Laticínios', 61, 3.2, 4.8, 3.3, 0, true, null),
('Iogurte Grego', 'Laticínios', 97, 9, 4, 5, 0, true, null),
('Queijo Mussarela', 'Laticínios', 300, 22, 3, 22, 0, true, null),
('Queijo Minas Frescal', 'Laticínios', 264, 17, 3, 20, 0, true, null),

-- OLEAGINOSAS
('Amêndoas', 'Oleaginosas', 579, 21, 22, 50, 12.5, true, null),
('Castanha-do-Pará', 'Oleaginosas', 656, 14, 12, 66, 8, true, null),

-- LEGUMINOSAS
('Feijão Preto Cozido', 'Leguminosas', 132, 8.9, 24, 0.5, 8.7, true, null),
('Feijão Carioca Cozido', 'Leguminosas', 127, 8.7, 22, 0.5, 8.5, true, null),
('Lentilha Cozida', 'Leguminosas', 116, 9, 20, 0.4, 7.9, true, null),
('Grão-de-Bico Cozido', 'Leguminosas', 164, 8.9, 27, 2.6, 7.6, true, null);

-- Insert default public exercises
INSERT INTO exercises (name, calories_per_min, category, is_public, user_id) VALUES

-- CARDIO
('Caminhada Leve', 4, 'Cardio', true, null),
('Caminhada Rápida', 5.5, 'Cardio', true, null),
('Corrida Leve', 10, 'Cardio', true, null),
('Corrida Moderada', 12, 'Cardio', true, null),
('Corrida Intensa', 14, 'Cardio', true, null),
('Ciclismo Moderado', 7, 'Cardio', true, null),
('Ciclismo Intenso', 12, 'Cardio', true, null),
('Natação Recreativa', 6, 'Cardio', true, null),
('Natação Treino', 10, 'Cardio', true, null),
('Pular Corda', 12, 'Cardio', true, null),
('Remo', 9, 'Cardio', true, null),
('Elíptico', 8, 'Cardio', true, null),
('Subir Escadas', 9, 'Cardio', true, null),
('Dança', 5.5, 'Cardio', true, null),
('Trilha', 7, 'Cardio', true, null),

-- MUSCULAÇÃO
('Musculação Leve', 4, 'Musculação', true, null),
('Musculação Intensa', 6, 'Musculação', true, null),
('Flexões', 7, 'Musculação', true, null),
('Barra Fixa', 8, 'Musculação', true, null),
('Agachamento', 6, 'Musculação', true, null),
('Afundo', 5.5, 'Musculação', true, null),
('Prancha', 4, 'Musculação', true, null),
('Abdominal', 4, 'Musculação', true, null),
('Burpee', 10, 'Musculação', true, null),

-- ESPORTES
('Basquete', 8, 'Esportes', true, null),
('Futebol', 10, 'Esportes', true, null),
('Tênis', 8, 'Esportes', true, null),
('Vôlei', 5, 'Esportes', true, null),
('Boxe', 12, 'Esportes', true, null),

-- FLEXIBILIDADE
('Yoga', 3, 'Flexibilidade', true, null),
('Pilates', 4, 'Flexibilidade', true, null),
('Alongamento', 2.5, 'Flexibilidade', true, null);
