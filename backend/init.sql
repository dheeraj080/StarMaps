BEGIN;

-- ============================================================
-- 1. Utility: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- ============================================================
-- 2. Launches
-- ============================================================

CREATE TABLE IF NOT EXISTS launches (
  id                    BIGSERIAL PRIMARY KEY,

  source                TEXT NOT NULL,
  source_id             TEXT NOT NULL UNIQUE,

  name                  TEXT NOT NULL,
  net_utc               TIMESTAMPTZ,
  status                TEXT,

  provider_name         TEXT,
  rocket_name           TEXT,

  pad_name              TEXT,
  pad_lat               DOUBLE PRECISION,
  pad_lon               DOUBLE PRECISION,

  webcast_url           TEXT,
  last_source_update    TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launches_net_utc
  ON launches (net_utc);

CREATE INDEX IF NOT EXISTS idx_launches_provider
  ON launches (provider_name);

CREATE INDEX IF NOT EXISTS idx_launches_rocket
  ON launches (rocket_name);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_launches_updated') THEN
    CREATE TRIGGER trg_launches_updated
    BEFORE UPDATE ON launches
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;



-- ============================================================
-- 3. Satellites (NORAD catalog objects)
-- ============================================================

CREATE TABLE IF NOT EXISTS satellites (
  norad_id              INTEGER PRIMARY KEY,
  name                  TEXT NOT NULL,

  intl_designator       TEXT,
  object_type           TEXT,
  country               TEXT,
  launch_date           DATE,
  decay_date            DATE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_satellites_name
  ON satellites (name);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_satellites_updated') THEN
    CREATE TRIGGER trg_satellites_updated
    BEFORE UPDATE ON satellites
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;



-- ============================================================
-- 4. TLE History
-- ============================================================

CREATE TABLE IF NOT EXISTS tles (
  id             BIGSERIAL PRIMARY KEY,

  norad_id       INTEGER NOT NULL
                   REFERENCES satellites(norad_id)
                   ON DELETE CASCADE,

  epoch          TIMESTAMPTZ NOT NULL,
  line1          TEXT NOT NULL,
  line2          TEXT NOT NULL,

  source         TEXT NOT NULL,
  fetched_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast latest lookup
CREATE INDEX IF NOT EXISTS idx_tles_norad_epoch_desc
  ON tles (norad_id, epoch DESC);

-- Deduplicate identical TLEs
CREATE UNIQUE INDEX IF NOT EXISTS tles_dedupe_idx
  ON tles (norad_id, epoch, line1, line2);



-- ============================================================
-- 5. Launch Payloads (Many payloads per launch)
-- ============================================================

CREATE TABLE IF NOT EXISTS launch_payloads (
  id                   BIGSERIAL PRIMARY KEY,

  launch_id            BIGINT NOT NULL
                        REFERENCES launches(id)
                        ON DELETE CASCADE,

  payload_name         TEXT NOT NULL,
  payload_type         TEXT,

  norad_id             INTEGER
                        REFERENCES satellites(norad_id)
                        ON DELETE SET NULL,

  intl_designator      TEXT,
  orbit_name           TEXT,
  remarks              TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_payloads_launch_id
  ON launch_payloads (launch_id);

CREATE INDEX IF NOT EXISTS idx_launch_payloads_norad
  ON launch_payloads (norad_id);

CREATE INDEX IF NOT EXISTS idx_launch_payloads_intldes
  ON launch_payloads (intl_designator);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_launch_payloads_updated') THEN
    CREATE TRIGGER trg_launch_payloads_updated
    BEFORE UPDATE ON launch_payloads
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;



-- ============================================================
-- 6. Celestial Objects (Planets, Moon, Asteroids, Comets)
-- ============================================================

CREATE TABLE IF NOT EXISTS objects (
  id                   BIGSERIAL PRIMARY KEY,

  kind                 TEXT NOT NULL,        -- planet, moon, asteroid, comet
  name                 TEXT NOT NULL,

  source               TEXT NOT NULL DEFAULT 'horizons',
  source_key           TEXT NOT NULL,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS objects_source_key_uq
  ON objects (source, source_key);

CREATE INDEX IF NOT EXISTS idx_objects_name
  ON objects (name);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_objects_updated') THEN
    CREATE TRIGGER trg_objects_updated
    BEFORE UPDATE ON objects
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;



-- ============================================================
-- 7. Ephemeris Cache (Earth-Centered Vectors)
-- ============================================================

CREATE TABLE IF NOT EXISTS ephemeris_cache (
  id               BIGSERIAL PRIMARY KEY,

  object_id        BIGINT NOT NULL
                    REFERENCES objects(id)
                    ON DELETE CASCADE,

  t_utc            TIMESTAMPTZ NOT NULL,

  frame            TEXT NOT NULL DEFAULT 'J2000',
  center           TEXT NOT NULL DEFAULT 'EARTH',
  step_sec         INTEGER NOT NULL,

  x_km             DOUBLE PRECISION NOT NULL,
  y_km             DOUBLE PRECISION NOT NULL,
  z_km             DOUBLE PRECISION NOT NULL,

  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ephem_dedupe_uq
  ON ephemeris_cache (object_id, t_utc, frame, center, step_sec);

CREATE INDEX IF NOT EXISTS idx_ephem_object_time
  ON ephemeris_cache (object_id, t_utc);



COMMIT;
