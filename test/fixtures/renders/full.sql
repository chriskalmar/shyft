
BEGIN TRANSACTION;
\set VERBOSITY terse
SET client_min_messages TO WARNING;


    CREATE SCHEMA IF NOT EXISTS geo;
  ;
create table "geo"."country" ("id" serial primary key, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text, "iso_code" text, "continent" bigint);
comment on table "geo"."country" is 'A country on our beautiful planet';
comment on column "geo"."country"."name" is 'The name of the country';
comment on column "geo"."country"."iso_code" is 'ISO code of the country';
comment on column "geo"."country"."continent" is 'The continent where the country is located';
alter table "geo"."country" add constraint "country_name_key" unique ("name");
alter table "geo"."country" add constraint "country_continent_fkey" foreign key ("continent") references "geo"."continent" ("id");

COMMIT;
