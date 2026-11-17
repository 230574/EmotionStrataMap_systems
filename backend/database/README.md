# PostgreSQL setup for EmotionStrataMap

## 1. Create database

```bash
createdb emotion_map
```

## 2. Apply schema

```bash
psql -d emotion_map -f database/01_schema.sql
```

## 3. Insert seed data

```bash
psql -d emotion_map -f database/02_seed.sql
```

## 4. Run app against PostgreSQL

```bash
set SPRING_PROFILES_ACTIVE=postgres
set DB_URL=jdbc:postgresql://localhost:5432/emotion_map
set DB_USERNAME=postgres
set DB_PASSWORD=postgres
./mvnw spring-boot:run
```

Or on Unix/macOS:

```bash
export SPRING_PROFILES_ACTIVE=postgres
export DB_URL=jdbc:postgresql://localhost:5432/emotion_map
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
./mvnw spring-boot:run
```

## 5. Optional: check tables

```sql
\dt
SELECT * FROM emotions;
SELECT * FROM place_types;
```

This schema follows the design document and uses PostgreSQL 16 + PostGIS 3.4 with geography(Point, 4326) for spatial data.
