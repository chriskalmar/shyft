
CREATE OR REPLACE FUNCTION <%= functionName %>(
  entity TEXT,
  state_id INTEGER
) RETURNS TEXT AS $$
DECLARE
  statesMap JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_state_name.tpl.sql)

  statesMap := '<%= statesMapFlipped %>';

  IF (statesMap->entity IS NOT NULL) THEN
    IF (statesMap->entity->state_id::TEXT IS NOT NULL) THEN
      RETURN statesMap->entity->>state_id::TEXT;
    ELSE
      RAISE EXCEPTION 'Unknown state id used in <%= functionName %>(): %.%', entity, state_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown entity name used in <%= functionName %>(): %', entity;
  END IF;

END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;
