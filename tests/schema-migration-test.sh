#!/usr/bin/env bash
set -Eeuo pipefail

command -v docker >/dev/null 2>&1 || { printf '%s\n' 'Docker is required.' >&2; exit 1; }
command -v dotnet >/dev/null 2>&1 || { printf '%s\n' '.NET SDK is required.' >&2; exit 1; }

readonly postgres_image='postgres:17-alpine@sha256:742f40ea20b9ff2ff31db5458d127452988a2164df9e17441e191f3b72252193'
readonly container_name="portfolio-schema-test-${RANDOM}-$$"
readonly schema_contract='deploy/portfolio/schema-contract.sql'
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

database_ready='false'
for _ in $(seq 1 40); do
  if docker exec "${container_name}" pg_isready \
    --username portfolio --dbname portfolio >/dev/null 2>&1; then
    sleep 0.5
    if docker exec "${container_name}" pg_isready \
        --username portfolio --dbname portfolio >/dev/null 2>&1; then
      database_ready='true'
      break
    fi
  fi
  sleep 0.5
done
if [[ "${database_ready}" != 'true' ]]; then
  docker logs "${container_name}" >&2 || true
  printf '%s\n' 'PostgreSQL did not become stably ready.' >&2
  exit 1
fi

mapped_port="$(docker port "${container_name}" 5432/tcp)"
mapped_port="${mapped_port##*:}"
[[ "${mapped_port}" =~ ^[0-9]+$ ]] || { printf '%s\n' 'Could not resolve test PostgreSQL port.' >&2; exit 1; }
export CONNECTION_STRING="Host=127.0.0.1;Port=${mapped_port};Database=portfolio;Username=portfolio;Password=local-schema-test-only"

dotnet run --project PortfolioDatabase/PortfolioDatabase.csproj --configuration Release >/dev/null
docker exec --interactive "${container_name}" \
  psql --username portfolio --dbname portfolio --set=ON_ERROR_STOP=1 \
  < "${schema_contract}" >/dev/null

docker exec "${container_name}" psql --username portfolio --dbname portfolio --quiet --command="
  CREATE SCHEMA legacy;
  CREATE TABLE legacy.\"GameNightUserOrders\" (\"Id\" integer);
  UPDATE schemaversions
  SET scriptname = 'PortfolioDatabase.scripts._1._0._0.008 - Preserve Legacy Migration Records.sql'
  WHERE scriptname LIKE '%009 - Remove Legacy Schema.sql';
" >/dev/null

dotnet run --project PortfolioDatabase/PortfolioDatabase.csproj --configuration Release >/dev/null
docker exec --interactive "${container_name}" \
  psql --username portfolio --dbname portfolio --set=ON_ERROR_STOP=1 \
  < "${schema_contract}" >/dev/null

docker exec "${container_name}" psql --username portfolio --dbname portfolio --quiet --command='
  ALTER TABLE "CardIds" DROP CONSTRAINT "PK_CardIds";
  ALTER TABLE "CardIds" ADD CONSTRAINT "PK_CardIds" PRIMARY KEY ("Id");
' >/dev/null
if docker exec --interactive "${container_name}" \
    psql --username portfolio --dbname portfolio --set=ON_ERROR_STOP=1 \
    < "${schema_contract}" >/dev/null 2>&1; then
  printf '%s\n' 'Schema contract accepted the wrong CardIds primary key.' >&2
  exit 1
fi
docker exec "${container_name}" psql --username portfolio --dbname portfolio --quiet --command='
  ALTER TABLE "CardIds" DROP CONSTRAINT "PK_CardIds";
  ALTER TABLE "CardIds"
    ADD CONSTRAINT "PK_CardIds"
    PRIMARY KEY ("Id", "Section", "CardCollectionId");
  ALTER TABLE "AspNetUserClaims" ALTER COLUMN "Id" DROP IDENTITY;
' >/dev/null
if docker exec --interactive "${container_name}" \
    psql --username portfolio --dbname portfolio --set=ON_ERROR_STOP=1 \
    < "${schema_contract}" >/dev/null 2>&1; then
  printf '%s\n' 'Schema contract accepted a non-identity claim identifier.' >&2
  exit 1
fi

printf '%s\n' 'PASS: fresh and upgraded databases converge without the legacy schema.'
