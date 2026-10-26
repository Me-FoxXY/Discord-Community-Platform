-- Reservations were written with clock_timestamp() in the database session's
-- local timezone. Preserve those instants when making the column timezone-aware.
ALTER TABLE "DiscordRateGate"
  ALTER COLUMN "nextAt" TYPE TIMESTAMPTZ(3)
  USING "nextAt" AT TIME ZONE current_setting('TimeZone');
