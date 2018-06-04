CREATE OR REPLACE FUNCTION get_language_iso_code(
  language_id INTEGER
) RETURNS TEXT AS $$
DECLARE
  languages JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_language_iso_code.tpl.sql)

  languages := '<%= languagesInverted %>';

  IF (languages->>language_id::TEXT IS NOT NULL) THEN
    RETURN languages->>language_id::TEXT;
  ELSE
    RAISE EXCEPTION 'Unknown language ID used in get_language_iso_code(): %', language_id;
  END IF;
END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;

