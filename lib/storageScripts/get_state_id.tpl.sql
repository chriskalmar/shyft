
CREATE OR REPLACE FUNCTION <%= functionName %>(
  entity text,
  state_name text
) RETURNS INTEGER AS $$
DECLARE
  statesMap JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_state_id.tpl.sql)

  statesMap := '<%= statesMap %>';

  IF (statesMap->entity IS NOT NULL) THEN
    IF (statesMap->entity->state_name IS NOT NULL) THEN
      RETURN statesMap->entity->state_name;
    ELSE
      RAISE EXCEPTION 'Unknown state name used in <%= functionName %>(): %.%', entity, state_name;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown entity name used in <%= functionName %>(): %', entity;
  END IF;

END;
$$
LANGUAGE plpgsql STRICT IMMUTABLE;
