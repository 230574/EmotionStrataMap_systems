DELETE FROM representative_places;
DELETE FROM posts;
DELETE FROM place_types;
DELETE FROM emotions;

INSERT INTO emotions (emotion_name, color_name, sort_order)
VALUES
  ('楽しい', '緑', 1),
  ('喜び', '黄', 2),
  ('不安・心配', '赤', 3),
  ('怖い・恐怖', '紫', 4),
  ('悲しい・寂しい', '青', 5);

INSERT INTO place_types (type_name, radius_m)
VALUES
  ('特定地点', 20),
  ('駅・公園・主要施設', 100),
  ('行政区の中心・地域の中心', 1000),
  ('市区町村の中心・広域エリア', 5000);
