
CREATE OR REPLACE FUNCTION <%= domain %>.<%= entity %>_id_generator(OUT result bigint) AS $$
DECLARE
  time_start   bigint := 14832288000;  -- 2017-01-01  (deci-seconds)
  time_current bigint := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 10);  -- (deci-seconds)

BEGIN

  -- bits: 52..20  (33 bits)   for time
  result := (time_current - time_start)::bigint << 20;

  -- bits: 19..0   (20 bits)   for sequence (modulo 2^20)
  result := result | ( nextval('<%= domain %>.<%= entity %>_id_seq') % 1048576 );

END;
$$ LANGUAGE PLPGSQL;


ALTER TABLE <%= domain %>.<%= entity %> ALTER COLUMN id SET DEFAULT <%= domain %>.<%= entity %>_id_generator();
