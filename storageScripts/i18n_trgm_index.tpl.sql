CREATE INDEX <%= indexName %> ON <%= storageTableName %> USING GIN ((i18n->'<%= attributeName %>'->>'<%= languageId %>') gin_trgm_ops);
