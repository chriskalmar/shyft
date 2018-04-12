<% _.forEach(items, ({textIndexName, trgmIndexName, attributeName, languageId}) => { %>
CREATE INDEX <%= textIndexName %> ON <%= entity %> ((i18n->'<%= attributeName %>'->>'<%= languageId %>') text_pattern_ops);
CREATE INDEX <%= trgmIndexName %> ON <%= entity %> USING GIN ((i18n->'<%= attributeName %>'->>'<%= languageId %>') gin_trgm_ops);
<% }) %>
