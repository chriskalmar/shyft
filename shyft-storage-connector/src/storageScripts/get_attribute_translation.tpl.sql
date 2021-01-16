CREATE OR REPLACE FUNCTION <%= functionName %>(
  rec ANYELEMENT,
  attribute TEXT,
  language TEXT
) RETURNS TEXT AS $$
DECLARE
  languages TEXT[];
  data JSONB;
  i18n JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_attribute_translation.tpl.sql)

  languages := '<%= languages %>';

  data := to_json(rec);
  i18n := (data->'i18n')::JSON;

  IF (language = ANY (languages)) THEN
    IF (i18n->attribute IS NOT NULL) THEN
      RETURN COALESCE(i18n->attribute->>language, data->>attribute);
    END IF;

    IF (data ? attribute) THEN
      RETURN data->>attribute;
    ELSE
      RAISE EXCEPTION 'Unknown attribute name used in <%= functionName %>(): %', attribute;
    END IF;
  END IF;

  RAISE EXCEPTION 'Unknown language used in <%= functionName %>(): %', language;
END;
$$
LANGUAGE plpgsql STABLE;

