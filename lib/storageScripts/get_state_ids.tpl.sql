
CREATE OR REPLACE FUNCTION <%= functionName %>(
  entity text,
  state_names text[]
) RETURNS INTEGER[] AS $$
DECLARE
  statesMap JSON;
  state_name TEXT;
  state_id INTEGER;
  result INTEGER[] DEFAULT '{}';
BEGIN

  -- This is an auto-generated function
  -- Template (get_state_ids.tpl.sql)

  statesMap := '<%=
    JSON
      .stringify(statesMap, null, 2)
      .split("\n")
      .join("\n  ")
  %>';

  IF (statesMap->entity IS NOT NULL) THEN
    FOREACH state_name IN ARRAY state_names LOOP
      IF (statesMap->entity->state_name IS NOT NULL) THEN
        state_id := statesMap->entity->state_name;
        result := result || state_id;
      ELSE
        RAISE EXCEPTION 'Unknown state name used in <%= functionName %>(): %.%', entity, state_name;
      END IF;
    END LOOP;
  ELSE
    RAISE EXCEPTION 'Unknown entity name used in <%= functionName %>(): %', entity;
  END IF;

  RETURN result;
END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;
