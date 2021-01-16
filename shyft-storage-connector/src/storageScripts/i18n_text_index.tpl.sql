CREATE INDEX <%= indexName %> ON <%= storageTableName %> ((i18n->'<%= attributeName %>'->>'<%= languageId %>') text_pattern_ops);
