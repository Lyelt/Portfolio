#!/usr/bin/env bash
set -Eeuo pipefail

command -v docker >/dev/null 2>&1 || { printf '%s\n' 'Docker is required.' >&2; exit 1; }
command -v dotnet >/dev/null 2>&1 || { printf '%s\n' '.NET SDK is required.' >&2; exit 1; }

readonly postgres_image='postgres:17-alpine@sha256:742f40ea20b9ff2ff31db5458d127452988a2164df9e17441e191f3b72252193'
readonly container_name="portfolio-schema-test-${RANDOM}-$$"
cleanup() {
  unset CONNECTION_STRING
  docker rm --force "${container_name}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach --rm \
  --name "${container_name}" \
  --env POSTGRES_DB=portfolio \
  --env POSTGRES_USER=portfolio \
  --env POSTGRES_PASSWORD=local-schema-test-only \
  --publish 127.0.0.1::5432 \
  "${postgres_image}" >/dev/null

for _ in $(seq 1 40); do
  if docker exec "${container_name}" pg_isready \
    --username portfolio --dbname portfolio >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
docker exec "${container_name}" pg_isready \
  --username portfolio --dbname portfolio >/dev/null

mapped_port="$(docker port "${container_name}" 5432/tcp)"
mapped_port="${mapped_port##*:}"
[[ "${mapped_port}" =~ ^[0-9]+$ ]] || { printf '%s\n' 'Could not resolve test PostgreSQL port.' >&2; exit 1; }
export CONNECTION_STRING="Host=127.0.0.1;Port=${mapped_port};Database=portfolio;Username=portfolio;Password=local-schema-test-only"

dotnet run --project PortfolioDatabase/PortfolioDatabase.csproj --configuration Release >/dev/null
[[ "$(docker exec "${container_name}" psql --username portfolio --dbname portfolio --tuples-only --no-align \
  --command="SELECT count(*) FROM information_schema.schemata WHERE schema_name = 'legacy';")" == '0' ]]
[[ "$(docker exec "${container_name}" psql --username portfolio --dbname portfolio --tuples-only --no-align \
  --command="SELECT count(*) FROM schemaversions WHERE scriptname LIKE '%009 - Remove Legacy Schema.sql';")" == '1' ]]

docker exec "${container_name}" psql --username portfolio --dbname portfolio --quiet --command="
  CREATE SCHEMA legacy;
  CREATE TABLE legacy.\"GameNightUserOrders\" (\"Id\" integer);
  UPDATE schemaversions
  SET scriptname = 'PortfolioDatabase.scripts._1._0._0.008 - Preserve Legacy Migration Records.sql'
  WHERE scriptname LIKE '%009 - Remove Legacy Schema.sql';
" >/dev/null

dotnet run --project PortfolioDatabase/PortfolioDatabase.csproj --configuration Release >/dev/null
[[ "$(docker exec "${container_name}" psql --username portfolio --dbname portfolio --tuples-only --no-align \
  --command="SELECT count(*) FROM information_schema.schemata WHERE schema_name = 'legacy';")" == '0' ]]
[[ "$(docker exec "${container_name}" psql --username portfolio --dbname portfolio --tuples-only --no-align \
  --command="SELECT count(*) FROM schemaversions WHERE scriptname LIKE '%009 - Remove Legacy Schema.sql';")" == '1' ]]

printf '%s\n' 'PASS: fresh and upgraded databases converge without the legacy schema.'
