CREATE OR REPLACE FUNCTION <%= functionName %>(
  rec anyelement,
  attribute TEXT,
  language TEXT
) RETURNS TEXT AS $$
DECLARE
  languages JSON;
  language_id TEXT;
  data JSONB;
  i18n JSON;
BEGIN

  -- This is an auto-generated function
  -- Template (get_attribute_translation.tpl.sql)

  languages := '<%=
    JSON
      .stringify(languages, null, 2)
      .split("\n")
      .join("\n  ")
  %>';

  data := to_json(rec);
  i18n := (data->'i18n')::JSON;
  language_id := languages->language;

  IF (language_id IS NOT NULL) THEN
    IF (i18n->attribute IS NOT NULL) THEN
      RETURN COALESCE(i18n->attribute->>language_id, data->>attribute);
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
LANGUAGE plpgsql;

