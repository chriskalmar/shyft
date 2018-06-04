CREATE OR REPLACE FUNCTION get_language_id(
  language_iso_code TEXT
) RETURNS INTEGER AS $$
DECLARE
  languages JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_language_id.tpl.sql)

  languages := '<%= languages %>';

  IF (languages->>language_iso_code IS NOT NULL) THEN
    RETURN languages->>language_iso_code;
  ELSE
    RAISE EXCEPTION 'Unknown language iso code used in get_language_id(): %', language_iso_code;
  END IF;
END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;

