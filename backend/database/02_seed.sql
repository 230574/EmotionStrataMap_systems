-- 初期マスタデータ

INSERT INTO emotions (emotion_id, emotion_name, color_name, sort_order)
VALUES
    (1, '楽しい', '緑', 1),
    (2, '喜び', '黄', 2),
    (3, '不安・心配', '赤', 3),
    (4, '怖い・恐怖', '紫', 4),
    (5, '悲しい・寂しい', '青', 5);

INSERT INTO place_types (place_type_id, type_name, radius_m)
VALUES
    (1, '特定地点', 20),
    (2, '駅・公園・主要施設', 100),
    (3, '行政区の中心・地域の中心', 1000),
    (4, '市区町村の中心・広域エリア', 5000);

INSERT INTO representative_places (place_type_id, place_name, area_name, latitude, longitude)
VALUES
    (2, '仙台駅周辺', '青葉区', 38.2601, 140.8822),
    (3, '青葉区中心部', '青葉区', 38.2680, 140.8700),
    (4, '仙台市', NULL, 38.2690, 140.8720);

-- 例: 管理者ユーザー
-- INSERT INTO users (user_id, password_hash, nickname, role)
-- VALUES ('admin01', '$2a$10$...', '管理者', 'admin');
