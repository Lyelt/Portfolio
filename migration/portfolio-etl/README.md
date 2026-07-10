# Portfolio one-time database converter

This image performs the reviewed MySQL 8.1 to PostgreSQL 17 data conversion. It is intentionally destructive only to a **fresh, isolated** PostgreSQL database created by all current DbUp scripts. It refuses a target whose initial row counts are not the expected DbUp seed state.

Build on the Mac mini's ARM64 host:

```sh
docker build --platform linux/arm64 -t portfolio-etl:reviewed migration/portfolio-etl
```

Mount two root-owned `0640` files at the fixed paths below. Their group must be the
supplemental group used for the non-root converter process, and they must contain
exactly these keys:

```dotenv
# /run/secrets/mysql.env
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=portfolioDB
MYSQL_USER=portfolio_etl_readonly
MYSQL_PASSWORD=replace-locally
```

```dotenv
# /run/secrets/postgres.env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=portfolio_conversion_v2
POSTGRES_USER=portfolio_etl
POSTGRES_PASSWORD=replace-locally
POSTGRES_TARGET_MARKER=0123456789abcdef0123456789abcdef
```

Run the container only on the private conversion networks, with no published ports or Docker socket. Add only the group that can read the two secret files; the image itself runs as numeric user/group `65532`. Keep shell tracing disabled. The MySQL user should have only `SELECT` on the restored database. The PostgreSQL target must use a conversion-only `portfolio_conversion_*` database name, have the matching `portfolio-etl-target:<marker>` database comment, and must not have another session attached.

The converter validates the exact 24-table source and corrected DbUp target schemas, preserves both legacy tables under `legacy`, retains `public.schemaversions`, copies in FK order in one PostgreSQL serializable transaction, compares per-table row counts and content digests, validates app invariants, and resets all identity sequences. It logs table names, row counts, and sanitized status codes only.

ASP.NET Identity's derived `NormalizedUserName`, `NormalizedEmail`, and role
`NormalizedName` fields are uppercased during conversion. This preserves the
case-insensitive lookup behavior that MySQL provided when the same stored values
are used with PostgreSQL's case-sensitive comparisons.

Sequence resets use PostgreSQL's restricted sequence privilege and run only after
all other validation. Because `setval` is not transactionally rolled back, never
reuse a target after a failure at the `identity_reset` or `commit` stage; retain
it for diagnosis and create a new conversion-only volume instead. An earlier
preflight/permission failure may be retried only after an administrator verifies
the exact fresh seed state and confirms that copying never began.

After success, create the migration artifact with PostgreSQL 17 `pg_dump -Fc --no-owner --no-acl`, checksum it, and perform a full isolated restore drill before using the guarded production importer.
