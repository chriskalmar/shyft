CREATE OR REPLACE FUNCTION <%= functionName %>(
  rec ANYELEMENT,
  attribute TEXT
) RETURNS TEXT AS $$
DECLARE
  languages TEXT[];
  language TEXT;
  defaultLanguage TEXT;
  data JSONB;
  i18n JSON;
  result JSONB DEFAULT '{}';
BEGIN

  -- This is an auto-generated function
  -- Template (get_attribute_translations.tpl.sql)

  languages := '<%= languages %>';
  defaultLanguage := '<%= defaultLanguage %>';

  data := to_json(rec);
  i18n := (data->'i18n')::JSON;

  IF (data ? attribute) THEN

    result := result || jsonb_build_object(defaultLanguage, data->>attribute);

    IF (i18n->attribute IS NOT NULL) THEN
      FOREACH language IN ARRAY languages LOOP
        IF (language <> defaultLanguage  AND  i18n->attribute IS NOT NULL) THEN
          result := result || jsonb_build_object(language, i18n->attribute->>language);
        END IF;
      END LOOP;
    END IF;

      RETURN result;
  ELSE
    RAISE EXCEPTION 'Unknown attribute name used in <%= functionName %>(): %', attribute;
  END IF;
END;
$$
LANGUAGE plpgsql STABLE;

