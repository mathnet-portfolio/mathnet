#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 -v user=$POSTGRES_USER --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER ROLE :user SET client_encoding TO 'utf8';
    ALTER ROLE :user SET default_transaction_isolation TO 'read committed';
    ALTER ROLE :user SET timezone TO 'Asia/Tokyo';
EOSQL
