
CREATE OR REPLACE FUNCTION <%= functionName %>(
  original JSONB,
  diff JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB := original;
  attributeName TEXT;
  translationsOriginal JSONB;
  translationsDiff JSONB;
BEGIN
  IF (original IS NULL) THEN
    RETURN diff;
  ELSEIF (diff IS NULL) THEN
    RETURN original;
  ELSE
    FOR attributeName IN SELECT * FROM jsonb_object_keys(diff)
    LOOP
      translationsOriginal := original #> ARRAY[attributeName];
      translationsDiff := diff #> ARRAY[attributeName];

      IF (translationsOriginal IS NULL) THEN
        result := jsonb_set(result, ARRAY[attributeName], translationsDiff);
      ELSEIF (translationsDiff IS NULL) THEN
        result := jsonb_set(result, ARRAY[attributeName], translationsOriginal);
      ELSE
        result := jsonb_set(result, ARRAY[attributeName], translationsOriginal || translationsDiff);
      END IF;

    END LOOP;

    RETURN result;
  END IF;
END;
$$
LANGUAGE plpgsql IMMUTABLE;
