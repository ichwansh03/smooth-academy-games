INSERT INTO levels (id, name, icon, label, min_range, max_range, required_stars, sort_order) VALUES
(1, 'Satuan', '🌟', '1–9', 1, 9, 0, 1),
(2, 'Puluhan', '⭐🌟', '10–99', 10, 99, 3, 2),
(3, 'Ratusan', '💫', '100–999', 100, 999, 3, 3),
(4, 'Ribuan', '✨', '1000–9999', 1000, 9999, 3, 4);

/*
INSERT INTO public.user_operators (id, operator, user_id)
VALUES
  (gen_random_uuid(), 'ADD', '7251e19e-1217-4532-abb1-cc944219a4f1'),
  (gen_random_uuid(), 'SUBTRACT', '7251e19e-1217-4532-abb1-cc944219a4f1'),
  (gen_random_uuid(), 'MULTIPLY', '7251e19e-1217-4532-abb1-cc944219a4f1'),
  (gen_random_uuid(), 'DIVIDE', '7251e19e-1217-4532-abb1-cc944219a4f1'),
  (gen_random_uuid(), 'HYBRID', '7251e19e-1217-4532-abb1-cc944219a4f1');
*/