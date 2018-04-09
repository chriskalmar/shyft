
CREATE OR REPLACE FUNCTION <%= functionName %>(
  entity text
) RETURNS JSON AS $$
DECLARE
  statesMap JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_state_map.tpl.sql)

  statesMap := '<%= statesMap %>';

  IF (statesMap->entity IS NOT NULL) THEN
    RETURN statesMap->entity;
  ELSE
    RAISE EXCEPTION 'Unknown entity name used in <%= functionName %>(): %', entity;
  END IF;

  RETURN result;
END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;
