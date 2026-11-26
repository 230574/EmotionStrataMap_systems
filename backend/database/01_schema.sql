-- PostgreSQL 16 + PostGIS 3.4
-- Database: emotion_map

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE emotions (
    emotion_id   SMALLINT PRIMARY KEY,
    emotion_name VARCHAR(20) NOT NULL UNIQUE,
    color_name   VARCHAR(10) NOT NULL,
    sort_order   SMALLINT NOT NULL UNIQUE
);

CREATE TABLE place_types (
    place_type_id SMALLINT PRIMARY KEY,
    type_name     VARCHAR(30) NOT NULL,
    radius_m      INTEGER NOT NULL CHECK (radius_m > 0)
);

CREATE TABLE users (
    user_id       VARCHAR(20) PRIMARY KEY CHECK (user_id ~ '^[A-Za-z0-9]{4,20}$'),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(72) NOT NULL,
    nickname      VARCHAR(20) NOT NULL,
    terms_agreed  BOOLEAN NOT NULL DEFAULT false,
    role          VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
    post_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     VARCHAR(20) NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    emotion_id  SMALLINT NOT NULL REFERENCES emotions (emotion_id) ON DELETE RESTRICT,
    latitude    NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude   NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    location    GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
                    ST_SetSRID(
                        ST_MakePoint(longitude::float8, latitude::float8), 4326
                    )::geography
                ) STORED,
    place_name  VARCHAR(100),
    comment     VARCHAR(200),
    posted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_deleted  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE representative_places (
    place_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    place_type_id SMALLINT NOT NULL REFERENCES place_types (place_type_id) ON DELETE RESTRICT,
    place_name    VARCHAR(50) NOT NULL,
    area_name     VARCHAR(50),
    latitude      NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude     NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    location      GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
                      ST_SetSRID(
                          ST_MakePoint(longitude::float8, latitude::float8), 4326
                      )::geography
                  ) STORED
);

CREATE INDEX idx_posts_location
    ON posts USING gist (location)
    WHERE is_deleted = false;

CREATE INDEX idx_posts_emotion_posted
    ON posts (emotion_id, posted_at)
    WHERE is_deleted = false;

CREATE INDEX idx_posts_user_posted
    ON posts (user_id, posted_at DESC);

CREATE INDEX idx_representative_places_location
    ON representative_places USING gist (location);

-- Optional: ensure updated_at is refreshed on row updates
-- CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();
