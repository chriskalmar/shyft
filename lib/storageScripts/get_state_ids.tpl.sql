
CREATE OR REPLACE FUNCTION <%= functionName %>(
  entity text,
  state_names text[]
) RETURNS INTEGER[] AS $$
DECLARE
  statesMap JSON;
  stateName TEXT;
  stateId INTEGER;
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
    FOREACH stateName IN ARRAY state_names LOOP
      IF (statesMap->entity->stateName IS NOT NULL) THEN
        stateId := statesMap->entity->stateName;
        result := result || stateId;
      ELSE
        RAISE EXCEPTION 'Unknown state name used in <%= functionName %>(): %.%', entity, stateName;
      END IF;
    END LOOP;
  ELSE
    RAISE EXCEPTION 'Unknown entity name used in <%= functionName %>(): %', entity;
  END IF;

  RETURN result;
END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;
