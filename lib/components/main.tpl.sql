
BEGIN TRANSACTION;
\set VERBOSITY terse
SET client_min_messages TO WARNING;

<%= sql %>;

COMMIT;
