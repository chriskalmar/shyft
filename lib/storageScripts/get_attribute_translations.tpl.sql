CREATE OR REPLACE FUNCTION <%= functionName %>(
  rec anyelement,
  attribute TEXT
) RETURNS TEXT AS $$
DECLARE
  languages JSON;
  languageNames TEXT[];
  languageName TEXT;
  languageId TEXT;
  data JSONB;
  i18n JSON;
  result JSONB DEFAULT '{}';
BEGIN

  -- This is an auto-generated function
  -- Template (get_attribute_translations.tpl.sql)

  languages := '<%=
    JSON
      .stringify(languages, null, 2)
      .split("\n")
      .join("\n  ")
  %>';

  languageNames := '{<%= languageNames %>}';

  data := to_json(rec);
  i18n := (data->'i18n')::JSON;

  IF (data ? attribute) THEN

    result := result || jsonb_build_object('default', data->>attribute);

    IF (i18n->attribute IS NOT NULL) THEN
      FOREACH languageName IN ARRAY languageNames LOOP
        languageId := languages->languageName;
        IF (languageName <> 'default'  AND  i18n->attribute IS NOT NULL) THEN
          result := result || jsonb_build_object(languageName, i18n->attribute->>languageId);
        END IF;
      END LOOP;
    END IF;

      RETURN result;
  ELSE
    RAISE EXCEPTION 'Unknown attribute name used in <%= functionName %>(): %', attribute;
  END IF;
END;
$$
LANGUAGE plpgsql;

