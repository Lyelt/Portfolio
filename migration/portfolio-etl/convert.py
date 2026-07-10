#!/usr/bin/env python3
"""One-shot, lossless MySQL 8.1 to PostgreSQL 17 portfolio conversion."""

from __future__ import annotations

import hashlib
import os
import re
import stat
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Iterable

import mysql.connector
import psycopg
from psycopg import sql


MYSQL_ENV_PATH = "/run/secrets/mysql.env"
POSTGRES_ENV_PATH = "/run/secrets/postgres.env"
FETCH_SIZE = 1_000
GAME_NIGHT_USER_NAMES = ("Nick", "Bash", "Ben", "Mom", "Sky")
EXPECTED_DBUP_SCRIPTS = (
    "001 - Create Users and Roles Tables.sql",
    "002 - Create Bowling Tables.sql",
    "003 - Create Speedrun Tables.sql",
    "003a - Add Speedrun Courses.sql",
    "003b - Add Speedrun Stars.sql",
    "004 - Add Dog Tables.sql",
    "005 - Add Yugioh Tables.sql",
    "006 - Add Game Night Tables.sql",
    "007 - Align PostgreSQL Keys With Application Models.sql",
    "008 - Preserve Legacy Migration Records.sql",
)


@dataclass(frozen=True)
class ColumnSpec:
    name: str
    mysql_type: str
    nullable: bool
    pg_type: str
    source_auto_increment: bool = False
    target_identity: bool = False
    boolean: bool = False
    target_default: str | None = None
    uppercase: bool = False


@dataclass(frozen=True)
class IndexSpec:
    name: str
    columns: tuple[str, ...]
    unique: bool = False
    target_name: str | None = None


@dataclass(frozen=True)
class ForeignKeySpec:
    columns: tuple[str, ...]
    referenced_table: str
    referenced_columns: tuple[str, ...]
    source_delete: str
    target_delete: str | None = None


@dataclass(frozen=True)
class TableSpec:
    source: str
    columns: tuple[ColumnSpec, ...]
    source_primary_key: tuple[str, ...] = ()
    target_primary_key: tuple[str, ...] | None = None
    indexes: tuple[IndexSpec, ...] = ()
    foreign_keys: tuple[ForeignKeySpec, ...] = ()
    target_schema: str = "public"
    target: str | None = None

    @property
    def target_table(self) -> str:
        return self.target or self.source

    @property
    def pg_primary_key(self) -> tuple[str, ...]:
        return self.source_primary_key if self.target_primary_key is None else self.target_primary_key


MYSQL_TO_PG = {
    "int": "integer",
    "bigint": "bigint",
    "bit(1)": "boolean",
    "tinyint(1)": "boolean",
    "longtext": "text",
    "datetime(6)": "timestamp(6) without time zone",
}


def C(
    name: str,
    mysql_type: str,
    nullable: bool = False,
    *,
    auto: bool = False,
    identity: bool = False,
    boolean: bool = False,
    default: str | None = None,
    uppercase: bool = False,
) -> ColumnSpec:
    if mysql_type.startswith("varchar("):
        pg_type = f"character varying{mysql_type[7:]}"
    else:
        pg_type = MYSQL_TO_PG[mysql_type]
    return ColumnSpec(
        name,
        mysql_type,
        nullable,
        pg_type,
        auto,
        identity,
        boolean,
        default,
        uppercase,
    )


def IX(
    name: str,
    *columns: str,
    unique: bool = False,
    target_name: str | None = None,
) -> IndexSpec:
    return IndexSpec(name, tuple(columns), unique, target_name)


def FK(
    column: str,
    referenced_table: str,
    referenced_column: str,
    delete: str,
    *,
    target_delete: str | None = None,
) -> ForeignKeySpec:
    return ForeignKeySpec(
        (column,), (referenced_table), (referenced_column,), delete, target_delete
    )


TABLES: tuple[TableSpec, ...] = (
    TableSpec(
        "AspNetRoles",
        (
            C("Id", "varchar(255)"), C("Name", "varchar(256)", True),
            C("NormalizedName", "varchar(256)", True, uppercase=True), C("ConcurrencyStamp", "longtext", True),
        ),
        ("Id",),
        indexes=(IX("RoleNameIndex", "NormalizedName", unique=True),),
    ),
    TableSpec(
        "AspNetUsers",
        (
            C("Id", "varchar(255)"), C("UserName", "varchar(256)", True),
            C("NormalizedUserName", "varchar(256)", True, uppercase=True), C("Email", "varchar(256)", True),
            C("NormalizedEmail", "varchar(256)", True, uppercase=True), C("EmailConfirmed", "bit(1)", boolean=True),
            C("PasswordHash", "longtext", True), C("SecurityStamp", "longtext", True),
            C("ConcurrencyStamp", "longtext", True), C("PhoneNumber", "longtext", True),
            C("PhoneNumberConfirmed", "bit(1)", boolean=True), C("TwoFactorEnabled", "bit(1)", boolean=True),
            C("LockoutEnd", "datetime(6)", True), C("LockoutEnabled", "bit(1)", boolean=True),
            C("AccessFailedCount", "int"),
        ),
        ("Id",),
        indexes=(IX("EmailIndex", "NormalizedEmail"), IX("UserNameIndex", "NormalizedUserName", unique=True)),
    ),
    TableSpec("Courses", (C("CourseId", "int"), C("Name", "longtext"), C("Abbreviation", "varchar(5)", True)), ("CourseId",)),
    TableSpec("BowlingSessions", (C("Id", "int", auto=True, identity=True), C("Date", "datetime(6)")), ("Id",)),
    TableSpec("GameNightMeals", (C("Id", "int", auto=True, identity=True), C("Name", "longtext"), C("DateAdded", "datetime(6)")), ("Id",)),
    TableSpec("Games", (C("Id", "int", auto=True, identity=True), C("Name", "longtext"), C("Image", "longtext", True), C("MinPlayers", "int"), C("MaxPlayers", "int")), ("Id",)),
    TableSpec("DogTimes", (C("Dog", "int"), C("Timestamp", "datetime(6)")), (), ("Dog", "Timestamp")),
    TableSpec(
        "Stars",
        (C("StarId", "int"), C("Name", "longtext"), C("CourseId", "int"), C("DisplayOrder", "int", default="0"), C("RtaGuideUrl", "longtext", True), C("SingleStarUrl", "longtext", True)),
        ("StarId",),
        indexes=(IX("IX_Stars_CourseId", "CourseId"),),
        foreign_keys=(FK("CourseId", "Courses", "CourseId", "CASCADE"),),
    ),
    TableSpec(
        "AspNetRoleClaims",
        (C("Id", "int", identity=True), C("RoleId", "varchar(255)"), C("ClaimType", "longtext", True), C("ClaimValue", "longtext", True)),
        ("Id",),
        indexes=(IX("IX_AspNetRoleClaims_RoleId", "RoleId"),),
        foreign_keys=(FK("RoleId", "AspNetRoles", "Id", "CASCADE"),),
    ),
    TableSpec(
        "AspNetUserClaims",
        (C("Id", "int", identity=True), C("UserId", "varchar(255)"), C("ClaimType", "longtext", True), C("ClaimValue", "longtext", True)),
        ("Id",),
        indexes=(IX("IX_AspNetUserClaims_UserId", "UserId"),),
        foreign_keys=(FK("UserId", "AspNetUsers", "Id", "CASCADE"),),
    ),
    TableSpec(
        "AspNetUserLogins",
        (C("LoginProvider", "varchar(128)"), C("ProviderKey", "varchar(128)"), C("ProviderDisplayName", "longtext", True), C("UserId", "varchar(255)")),
        ("LoginProvider", "ProviderKey"),
        indexes=(IX("IX_AspNetUserLogins_UserId", "UserId"),),
        foreign_keys=(FK("UserId", "AspNetUsers", "Id", "CASCADE"),),
    ),
    TableSpec(
        "AspNetUserRoles",
        (C("UserId", "varchar(255)"), C("RoleId", "varchar(255)")),
        ("UserId", "RoleId"),
        indexes=(IX("IX_AspNetUserRoles_RoleId", "RoleId"),),
        foreign_keys=(FK("UserId", "AspNetUsers", "Id", "CASCADE"), FK("RoleId", "AspNetRoles", "Id", "CASCADE")),
    ),
    TableSpec(
        "AspNetUserTokens",
        (C("UserId", "varchar(255)"), C("LoginProvider", "varchar(128)"), C("Name", "varchar(128)"), C("Value", "longtext", True)),
        ("UserId", "LoginProvider", "Name"),
        foreign_keys=(FK("UserId", "AspNetUsers", "Id", "CASCADE"),),
    ),
    TableSpec(
        "GameNightUserOrders",
        (C("Id", "int", auto=True, identity=True), C("UserId", "varchar(255)"), C("Order", "int")),
        ("Id",),
        indexes=(IX("IX_GameNightUserOrders_UserId", "UserId", unique=True, target_name="IX_LegacyGameNightUserOrders_UserId"),),
        foreign_keys=(
            FK("UserId", "AspNetUsers", "Id", "CASCADE", target_delete="NO ACTION"),
        ),
        target_schema="legacy",
    ),
    TableSpec(
        "BowlingGames",
        (C("Id", "int", auto=True, identity=True), C("UserId", "varchar(255)"), C("BowlingSessionId", "int"), C("TotalScore", "int"), C("GameNumber", "int")),
        ("Id",),
        indexes=(IX("IX_BowlingGames_UserId", "UserId"), IX("IX_BowlingGames_BowlingSessionId_GameNumber_UserId", "BowlingSessionId", "GameNumber", "UserId", unique=True)),
        foreign_keys=(FK("UserId", "AspNetUsers", "Id", "CASCADE"), FK("BowlingSessionId", "BowlingSessions", "Id", "CASCADE")),
    ),
    TableSpec(
        "BowlingFrames",
        (C("Id", "int", auto=True, identity=True), C("BowlingGameId", "int"), C("FrameNumber", "int"), C("Roll1Score", "int"), C("Roll2Score", "int", default="0"), C("Roll3Score", "int", default="0"), C("IsSplit", "bit(1)", boolean=True, default="false")),
        ("Id",),
        indexes=(IX("IX_BowlingFrames_BowlingGameId_FrameNumber", "BowlingGameId", "FrameNumber", unique=True),),
        foreign_keys=(FK("BowlingGameId", "BowlingGames", "Id", "CASCADE"),),
    ),
    TableSpec(
        "ArchivedStarTimes",
        (C("Id", "int", auto=True, identity=True), C("Timestamp", "datetime(6)"), C("StarId", "int"), C("UserId", "varchar(255)", True), C("LastUpdated", "datetime(6)"), C("Time", "bigint"), C("VideoUrl", "longtext", True)),
        ("Id",),
        indexes=(IX("IX_ArchivedStarTimes_StarId", "StarId"), IX("IX_ArchivedStarTimes_UserId", "UserId")),
        foreign_keys=(
            FK("UserId", "AspNetUsers", "Id", "NO ACTION", target_delete="RESTRICT"),
            FK("StarId", "Stars", "StarId", "CASCADE"),
        ),
    ),
    TableSpec(
        "StarTimes",
        (C("StarId", "int"), C("UserId", "varchar(255)"), C("LastUpdated", "datetime(6)"), C("Time", "bigint"), C("VideoUrl", "longtext", True)),
        ("StarId", "UserId"),
        indexes=(IX("IX_StarTimes_UserId", "UserId"),),
        foreign_keys=(FK("StarId", "Stars", "StarId", "CASCADE"), FK("UserId", "AspNetUsers", "Id", "CASCADE")),
    ),
    TableSpec(
        "CardCollections",
        (C("Id", "int", auto=True, identity=True), C("UserId", "varchar(255)"), C("Name", "varchar(255)")),
        ("Id",),
        indexes=(IX("IX_CardCollections_UserId_Name", "UserId", "Name", unique=True),),
        foreign_keys=(FK("UserId", "AspNetUsers", "Id", "CASCADE"),),
    ),
    TableSpec(
        "CardIds",
        (C("Id", "int"), C("Section", "varchar(255)"), C("SetCode", "longtext", True), C("Quantity", "int"), C("CardCollectionId", "int")),
        ("Id", "Section", "CardCollectionId"),
        indexes=(IX("IX_CardIds_CardCollectionId", "CardCollectionId"),),
        foreign_keys=(FK("CardCollectionId", "CardCollections", "Id", "CASCADE"),),
    ),
    TableSpec(
        "GameNights",
        (C("Id", "int", auto=True, identity=True), C("Date", "datetime(6)"), C("GameNightMealId", "int", True), C("UserId", "varchar(255)", True), C("IsCancelled", "tinyint(1)", True, boolean=True)),
        ("Id",),
        indexes=(IX("IX_GameNights_GameNightMealId", "GameNightMealId"), IX("IX_GameNights_UserId", "UserId")),
        foreign_keys=(
            FK("UserId", "AspNetUsers", "Id", "NO ACTION"),
            FK("GameNightMealId", "GameNightMeals", "Id", "NO ACTION"),
        ),
    ),
    TableSpec(
        "GameNightGameNightGame",
        (C("GameNightId", "int"), C("GamesId", "int")),
        ("GameNightId", "GamesId"),
        indexes=(IX("IX_GameNightGameNightGame_GamesId", "GamesId"),),
        foreign_keys=(FK("GameNightId", "GameNights", "Id", "CASCADE"), FK("GamesId", "Games", "Id", "CASCADE")),
    ),
    TableSpec(
        "GameNightUserStatuses",
        (C("Id", "int", auto=True, identity=True), C("GameNightId", "int"), C("UserId", "varchar(255)"), C("Status", "int")),
        ("Id",),
        indexes=(IX("IX_GameNightUserStatuses_GameNightId", "GameNightId"), IX("IX_GameNightUserStatuses_UserId", "UserId")),
        foreign_keys=(FK("GameNightId", "GameNights", "Id", "CASCADE"), FK("UserId", "AspNetUsers", "Id", "CASCADE")),
    ),
    TableSpec(
        "__EFMigrationsHistory",
        (C("MigrationId", "varchar(95)"), C("ProductVersion", "varchar(32)")),
        ("MigrationId",),
        target_schema="legacy",
    ),
)


TABLE_BY_SOURCE = {table.source: table for table in TABLES}
TARGET_BY_SOURCE = {
    table.source: (table.target_schema, table.target_table) for table in TABLES
}


class SafeFailure(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


@dataclass
class RunState:
    stage: str = "startup"
    table: str = "-"


STATE = RunState()


def log(message: str) -> None:
    print(message, flush=True)


def fail(code: str) -> None:
    raise SafeFailure(code)


def read_env_file(path: str, allowed: set[str], required: set[str]) -> dict[str, str]:
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(path, flags)
    except OSError:
        fail("secret_open")
    try:
        info = os.fstat(fd)
        mode = stat.S_IMODE(info.st_mode)
        if (
            not stat.S_ISREG(info.st_mode)
            or info.st_uid != 0
            or mode not in (0o600, 0o640)
        ):
            fail("secret_permissions")
        if info.st_size > 65_536:
            fail("secret_size")
        raw = os.read(fd, 65_537)
    finally:
        os.close(fd)
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeDecodeError:
        fail("secret_encoding")

    values: dict[str, str] = {}
    key_pattern = re.compile(r"^[A-Z][A-Z0-9_]*$")
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        key, separator, value = stripped.partition("=")
        key = key.strip()
        value = value.strip()
        if not separator or not key_pattern.fullmatch(key) or key not in allowed or key in values:
            fail("secret_format")
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        if not value or "\x00" in value:
            fail("secret_value")
        values[key] = value
    if set(values) != required:
        fail("secret_keys")
    return values


def parse_port(value: str) -> int:
    try:
        port = int(value)
    except ValueError:
        fail("secret_port")
    if not 1 <= port <= 65_535:
        fail("secret_port")
    return port


def validate_target_identity(
    connection: Any,
    expected_database: str,
    expected_marker: str,
) -> None:
    STATE.stage = "target_identity"
    STATE.table = "-"
    if not re.fullmatch(r"portfolio_conversion_[a-z0-9_]+", expected_database):
        fail("target_database_name")
    if not re.fullmatch(r"[a-f0-9]{32}", expected_marker):
        fail("target_marker_format")
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT current_database(), pg_catalog.shobj_description(oid, 'pg_database') "
            "FROM pg_catalog.pg_database WHERE datname = current_database()"
        )
        row = cursor.fetchone()
        if row != (expected_database, f"portfolio-etl-target:{expected_marker}"):
            fail("target_identity_mismatch")
        cursor.execute(
            "SELECT count(*) FROM pg_catalog.pg_stat_activity "
            "WHERE datname = current_database() AND pid <> pg_backend_pid()"
        )
        if cursor.fetchone()[0] != 0:
            fail("target_other_sessions")


def mysql_identifier(name: str) -> str:
    if name not in TABLE_BY_SOURCE and not any(
        name == column.name for table in TABLES for column in table.columns
    ):
        fail("manifest_identifier")
    return "`" + name.replace("`", "``") + "`"


def expected_source_indexes(table: TableSpec) -> tuple[tuple[Any, ...], ...]:
    return tuple(sorted((item.name, item.unique, item.columns) for item in table.indexes))


def expected_target_indexes(table: TableSpec) -> tuple[tuple[Any, ...], ...]:
    return tuple(
        sorted((item.target_name or item.name, item.unique, item.columns) for item in table.indexes)
    )


def preflight_source(connection: Any, database: str) -> None:
    STATE.stage = "source_schema"
    cursor = connection.cursor(buffered=True)
    try:
        cursor.execute(
            "SELECT TABLE_NAME, ENGINE, TABLE_TYPE FROM information_schema.TABLES "
            "WHERE TABLE_SCHEMA = %s ORDER BY TABLE_NAME",
            (database,),
        )
        table_rows = cursor.fetchall()
        if {row[0] for row in table_rows} != set(TABLE_BY_SOURCE):
            fail("source_table_set")
        if any(row[1] != "InnoDB" or row[2] != "BASE TABLE" for row in table_rows):
            fail("source_table_engine")

        cursor.execute(
            "SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, EXTRA "
            "FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = %s "
            "ORDER BY TABLE_NAME, ORDINAL_POSITION",
            (database,),
        )
        actual_columns: dict[str, list[tuple[Any, ...]]] = {name: [] for name in TABLE_BY_SOURCE}
        for table_name, column_name, column_type, nullable, extra in cursor.fetchall():
            actual_columns[table_name].append(
                (column_name, column_type.lower(), nullable == "YES", "auto_increment" in extra.lower())
            )
        for table in TABLES:
            STATE.table = table.source
            expected = [
                (column.name, column.mysql_type, column.nullable, column.source_auto_increment)
                for column in table.columns
            ]
            if actual_columns[table.source] != expected:
                fail("source_columns")

        cursor.execute(
            "SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME "
            "FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = %s "
            "ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX",
            (database,),
        )
        primary: dict[str, list[str]] = {name: [] for name in TABLE_BY_SOURCE}
        secondary_rows: dict[tuple[str, str, bool], list[str]] = {}
        for table_name, index_name, non_unique, _position, column_name in cursor.fetchall():
            if index_name == "PRIMARY":
                primary[table_name].append(column_name)
            else:
                secondary_rows.setdefault((table_name, index_name, not bool(non_unique)), []).append(column_name)
        actual_indexes: dict[str, list[tuple[Any, ...]]] = {name: [] for name in TABLE_BY_SOURCE}
        for (table_name, index_name, unique), columns in secondary_rows.items():
            actual_indexes[table_name].append((index_name, unique, tuple(columns)))
        for table in TABLES:
            STATE.table = table.source
            if tuple(primary[table.source]) != table.source_primary_key:
                fail("source_primary_key")
            if tuple(sorted(actual_indexes[table.source])) != expected_source_indexes(table):
                fail("source_indexes")

        cursor.execute(
            "SELECT k.TABLE_NAME, k.CONSTRAINT_NAME, k.ORDINAL_POSITION, k.COLUMN_NAME, "
            "k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.DELETE_RULE "
            "FROM information_schema.KEY_COLUMN_USAGE k "
            "JOIN information_schema.REFERENTIAL_CONSTRAINTS r "
            "ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.TABLE_NAME = k.TABLE_NAME "
            "AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME "
            "WHERE k.TABLE_SCHEMA = %s AND k.REFERENCED_TABLE_NAME IS NOT NULL "
            "ORDER BY k.TABLE_NAME, k.CONSTRAINT_NAME, k.ORDINAL_POSITION",
            (database,),
        )
        grouped_fks: dict[tuple[str, str, str, str], list[tuple[str, str]]] = {}
        for table_name, constraint_name, _position, column, ref_table, ref_column, delete_rule in cursor.fetchall():
            grouped_fks.setdefault((table_name, constraint_name, ref_table, delete_rule), []).append((column, ref_column))
        actual_fks: dict[str, list[tuple[Any, ...]]] = {name: [] for name in TABLE_BY_SOURCE}
        for (table_name, _constraint, ref_table, delete_rule), pairs in grouped_fks.items():
            actual_fks[table_name].append(
                (tuple(pair[0] for pair in pairs), ref_table, tuple(pair[1] for pair in pairs), delete_rule)
            )
        for table in TABLES:
            STATE.table = table.source
            expected = sorted(
                (fk.columns, fk.referenced_table, fk.referenced_columns, fk.source_delete)
                for fk in table.foreign_keys
            )
            if sorted(actual_fks[table.source]) != expected:
                fail("source_foreign_keys")
    finally:
        cursor.close()
    STATE.table = "-"


def target_table_key(table: TableSpec) -> tuple[str, str]:
    return (table.target_schema, table.target_table)


def preflight_target(connection: Any) -> tuple[str, ...]:
    STATE.stage = "target_schema"
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT schemaname, tablename FROM pg_catalog.pg_tables "
            "WHERE schemaname IN ('public', 'legacy') ORDER BY 1, 2"
        )
        expected_tables = {target_table_key(table) for table in TABLES}
        expected_tables.add(("public", "schemaversions"))
        if set(cursor.fetchall()) != expected_tables:
            fail("target_table_set")

        cursor.execute(
            "SELECT n.nspname, c.relname, a.attname, "
            "pg_catalog.format_type(a.atttypid, a.atttypmod), NOT a.attnotnull, a.attidentity, "
            "pg_catalog.pg_get_expr(d.adbin, d.adrelid) "
            "FROM pg_catalog.pg_attribute a "
            "JOIN pg_catalog.pg_class c ON c.oid = a.attrelid "
            "JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace "
            "LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum "
            "WHERE n.nspname IN ('public', 'legacy') AND a.attnum > 0 AND NOT a.attisdropped "
            "AND c.relkind IN ('r', 'p') ORDER BY n.nspname, c.relname, a.attnum"
        )
        actual_columns: dict[tuple[str, str], dict[str, tuple[Any, ...]]] = {
            target_table_key(table): {} for table in TABLES
        }
        for schema_name, table_name, column_name, data_type, nullable, identity, default in cursor.fetchall():
            key = (schema_name, table_name)
            if key in actual_columns:
                actual_columns[key][column_name] = (
                    data_type,
                    nullable,
                    identity == "d",
                    default,
                )
        for table in TABLES:
            STATE.table = table.source
            expected = {
                column.name: (
                    column.pg_type,
                    column.nullable,
                    column.target_identity,
                    column.target_default,
                )
                for column in table.columns
            }
            if actual_columns[target_table_key(table)] != expected:
                fail("target_columns")

        cursor.execute(
            "SELECT n.nspname, c.relname, a.attname, u.ordinality "
            "FROM pg_catalog.pg_constraint con "
            "JOIN pg_catalog.pg_class c ON c.oid = con.conrelid "
            "JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace "
            "CROSS JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS u(attnum, ordinality) "
            "JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = u.attnum "
            "WHERE con.contype = 'p' AND n.nspname IN ('public', 'legacy') "
            "ORDER BY n.nspname, c.relname, u.ordinality"
        )
        primary: dict[tuple[str, str], list[str]] = {target_table_key(table): [] for table in TABLES}
        for schema_name, table_name, column_name, _position in cursor.fetchall():
            key = (schema_name, table_name)
            if key in primary:
                primary[key].append(column_name)
        for table in TABLES:
            STATE.table = table.source
            if tuple(primary[target_table_key(table)]) != table.pg_primary_key:
                fail("target_primary_key")

        cursor.execute(
            "SELECT n.nspname, t.relname, i.relname, x.indisunique, a.attname, u.ordinality, "
            "x.indisvalid, x.indisready, x.indpred IS NULL, x.indexprs IS NULL "
            "FROM pg_catalog.pg_index x "
            "JOIN pg_catalog.pg_class t ON t.oid = x.indrelid "
            "JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace "
            "JOIN pg_catalog.pg_class i ON i.oid = x.indexrelid "
            "CROSS JOIN LATERAL unnest(x.indkey) WITH ORDINALITY AS u(attnum, ordinality) "
            "JOIN pg_catalog.pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum "
            "WHERE NOT x.indisprimary AND n.nspname IN ('public', 'legacy') "
            "ORDER BY n.nspname, t.relname, i.relname, u.ordinality"
        )
        grouped_indexes: dict[tuple[str, str, str, bool], list[str]] = {}
        for schema_name, table_name, index_name, unique, column_name, _position, valid, ready, no_predicate, no_expressions in cursor.fetchall():
            if not (valid and ready and no_predicate and no_expressions):
                fail("target_index_state")
            grouped_indexes.setdefault((schema_name, table_name, index_name, unique), []).append(column_name)
        actual_indexes: dict[tuple[str, str], list[tuple[Any, ...]]] = {
            target_table_key(table): [] for table in TABLES
        }
        for (schema_name, table_name, index_name, unique), columns in grouped_indexes.items():
            key = (schema_name, table_name)
            if key in actual_indexes:
                actual_indexes[key].append((index_name, unique, tuple(columns)))
        for table in TABLES:
            STATE.table = table.source
            if tuple(sorted(actual_indexes[target_table_key(table)])) != expected_target_indexes(table):
                fail("target_indexes")

        cursor.execute(
            "SELECT nc.nspname, c.relname, con.conname, ac.attname, np.nspname, p.relname, "
            "ap.attname, con.confdeltype, con.convalidated, u.ordinality "
            "FROM pg_catalog.pg_constraint con "
            "JOIN pg_catalog.pg_class c ON c.oid = con.conrelid "
            "JOIN pg_catalog.pg_namespace nc ON nc.oid = c.relnamespace "
            "JOIN pg_catalog.pg_class p ON p.oid = con.confrelid "
            "JOIN pg_catalog.pg_namespace np ON np.oid = p.relnamespace "
            "CROSS JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY "
            "AS u(child_attnum, parent_attnum, ordinality) "
            "JOIN pg_catalog.pg_attribute ac ON ac.attrelid = c.oid AND ac.attnum = u.child_attnum "
            "JOIN pg_catalog.pg_attribute ap ON ap.attrelid = p.oid AND ap.attnum = u.parent_attnum "
            "WHERE con.contype = 'f' AND nc.nspname IN ('public', 'legacy') "
            "ORDER BY nc.nspname, c.relname, con.conname, u.ordinality"
        )
        delete_names = {"a": "NO ACTION", "r": "RESTRICT", "c": "CASCADE", "n": "SET NULL", "d": "SET DEFAULT"}
        grouped_fks: dict[tuple[Any, ...], list[tuple[str, str]]] = {}
        for child_schema, child_table, constraint, child_column, parent_schema, parent_table, parent_column, delete_code, validated, _position in cursor.fetchall():
            if not validated:
                fail("target_fk_unvalidated")
            key = (child_schema, child_table, constraint, parent_schema, parent_table, delete_names[delete_code])
            grouped_fks.setdefault(key, []).append((child_column, parent_column))
        actual_fks: dict[tuple[str, str], list[tuple[Any, ...]]] = {
            target_table_key(table): [] for table in TABLES
        }
        for (child_schema, child_table, _constraint, parent_schema, parent_table, delete_rule), pairs in grouped_fks.items():
            key = (child_schema, child_table)
            if key in actual_fks:
                actual_fks[key].append(
                    (tuple(pair[0] for pair in pairs), parent_schema, parent_table, tuple(pair[1] for pair in pairs), delete_rule)
                )
        for table in TABLES:
            STATE.table = table.source
            expected = []
            for fk in table.foreign_keys:
                parent_schema, parent_table = TARGET_BY_SOURCE[fk.referenced_table]
                expected.append(
                    (fk.columns, parent_schema, parent_table, fk.referenced_columns, fk.target_delete or fk.source_delete)
                )
            if sorted(actual_fks[target_table_key(table)]) != sorted(expected):
                fail("target_foreign_keys")

        cursor.execute('SELECT "scriptname" FROM public.schemaversions ORDER BY "scriptname"')
        journal = tuple(row[0] for row in cursor.fetchall())
        if len(journal) != len(EXPECTED_DBUP_SCRIPTS):
            fail("target_journal_count")
        if any(not any(script.endswith(suffix) for script in journal) for suffix in EXPECTED_DBUP_SCRIPTS):
            fail("target_journal_scripts")
    STATE.table = "-"
    return journal


def normalize_value(column: ColumnSpec, value: Any) -> Any:
    if value is None:
        if not column.nullable:
            fail("unexpected_null")
        return None
    if column.boolean:
        if isinstance(value, (bytes, bytearray)):
            value = int.from_bytes(value, "big")
        if value not in (0, 1, False, True):
            fail("invalid_boolean")
        return bool(value)
    if isinstance(value, str):
        if "\x00" in value:
            fail("text_nul")
        if column.uppercase:
            return value.upper()
    if isinstance(value, datetime) and value.tzinfo is not None:
        fail("timestamp_timezone")
    return value


def canonical_value(value: Any) -> bytes:
    if value is None:
        return b"N"
    if isinstance(value, bool):
        return b"B1" if value else b"B0"
    if isinstance(value, int):
        return b"I" + str(value).encode("ascii")
    if isinstance(value, str):
        return b"S" + value.encode("utf-8", "strict")
    if isinstance(value, datetime):
        if value.tzinfo is not None:
            fail("timestamp_timezone")
        return b"T" + value.isoformat(timespec="microseconds").encode("ascii")
    fail("unsupported_value_type")


def row_hash(row: Iterable[Any]) -> bytes:
    digest = hashlib.sha256()
    for value in row:
        encoded = canonical_value(value)
        digest.update(len(encoded).to_bytes(8, "big"))
        digest.update(encoded)
    return digest.digest()


def multiset_hash(hashes: list[bytes]) -> bytes:
    digest = hashlib.sha256()
    for value in sorted(hashes):
        digest.update(value)
    return digest.digest()


def validate_fresh_target(connection: Any) -> None:
    STATE.stage = "target_freshness"
    with connection.cursor() as cursor:
        for table in TABLES:
            STATE.table = table.source
            cursor.execute(
                sql.SQL("SELECT count(*) FROM {}").format(
                    sql.Identifier(table.target_schema, table.target_table)
                )
            )
            count = cursor.fetchone()[0]
            expected = 26 if table.source == "Courses" else 126 if table.source == "Stars" else 0
            if count != expected:
                fail("target_not_fresh")
    STATE.table = "-"


def truncate_target(connection: Any) -> None:
    STATE.stage = "target_truncate"
    table_list = sql.SQL(", ").join(
        sql.Identifier(table.target_schema, table.target_table) for table in TABLES
    )
    with connection.cursor() as cursor:
        cursor.execute(sql.SQL("TRUNCATE TABLE {} CONTINUE IDENTITY").format(table_list))


def copy_source_to_target(source: Any, target: Any) -> dict[str, tuple[int, bytes]]:
    results: dict[str, tuple[int, bytes]] = {}
    STATE.stage = "copy"
    for table in TABLES:
        STATE.table = table.source
        source_columns = ", ".join(mysql_identifier(column.name) for column in table.columns)
        query = f"SELECT {source_columns} FROM {mysql_identifier(table.source)}"
        source_cursor = source.cursor(buffered=False)
        row_hashes: list[bytes] = []
        count = 0
        try:
            source_cursor.execute(query)
            with target.cursor() as target_cursor:
                copy_statement = sql.SQL("COPY {} ({}) FROM STDIN").format(
                    sql.Identifier(table.target_schema, table.target_table),
                    sql.SQL(", ").join(sql.Identifier(column.name) for column in table.columns),
                )
                with target_cursor.copy(copy_statement) as copier:
                    while batch := source_cursor.fetchmany(FETCH_SIZE):
                        for raw_row in batch:
                            converted = tuple(
                                normalize_value(column, value)
                                for column, value in zip(table.columns, raw_row, strict=True)
                            )
                            copier.write_row(converted)
                            row_hashes.append(row_hash(converted))
                            count += 1
        finally:
            source_cursor.close()
        results[table.source] = (count, multiset_hash(row_hashes))
        log(f"table={table.source} rows={count} status=copied")
    STATE.table = "-"
    return results


def verify_target_rows(target: Any, expected: dict[str, tuple[int, bytes]]) -> None:
    STATE.stage = "target_rows"
    with target.cursor() as cursor:
        for table in TABLES:
            STATE.table = table.source
            cursor.execute(
                sql.SQL("SELECT {} FROM {}").format(
                    sql.SQL(", ").join(sql.Identifier(column.name) for column in table.columns),
                    sql.Identifier(table.target_schema, table.target_table),
                )
            )
            hashes: list[bytes] = []
            count = 0
            while batch := cursor.fetchmany(FETCH_SIZE):
                for raw_row in batch:
                    converted = tuple(
                        normalize_value(column, value)
                        for column, value in zip(table.columns, raw_row, strict=True)
                    )
                    hashes.append(row_hash(converted))
                    count += 1
            source_count, source_hash = expected[table.source]
            if count != source_count or multiset_hash(hashes) != source_hash:
                fail("target_content_mismatch")
    STATE.table = "-"


def validate_orphans(target: Any) -> None:
    STATE.stage = "foreign_key_rows"
    with target.cursor() as cursor:
        for table in TABLES:
            STATE.table = table.source
            for foreign_key in table.foreign_keys:
                parent_schema, parent_table = TARGET_BY_SOURCE[foreign_key.referenced_table]
                nonnull = sql.SQL(" AND ").join(
                    sql.SQL("c.{} IS NOT NULL").format(sql.Identifier(column))
                    for column in foreign_key.columns
                )
                matches = sql.SQL(" AND ").join(
                    sql.SQL("p.{} = c.{}").format(sql.Identifier(parent), sql.Identifier(child))
                    for child, parent in zip(
                        foreign_key.columns, foreign_key.referenced_columns, strict=True
                    )
                )
                cursor.execute(
                    sql.SQL(
                        "SELECT count(*) FROM {} AS c WHERE {} "
                        "AND NOT EXISTS (SELECT 1 FROM {} AS p WHERE {})"
                    ).format(
                        sql.Identifier(table.target_schema, table.target_table),
                        nonnull,
                        sql.Identifier(parent_schema, parent_table),
                        matches,
                    )
                )
                if cursor.fetchone()[0] != 0:
                    fail("foreign_key_orphan")
    STATE.table = "-"


def validate_application_invariants(target: Any) -> None:
    STATE.stage = "application_invariants"
    STATE.table = "AspNetUsers"
    with target.cursor() as cursor:
        cursor.execute(
            '''
            SELECT
              (SELECT count(*) FROM public."AspNetUsers"
               WHERE "UserName" = %s AND "NormalizedUserName" = %s) = 1,
              (SELECT count(*) FROM public."AspNetRoles"
               WHERE "Name" = %s AND "NormalizedName" = %s) = 1,
              (SELECT count(*) FROM public."AspNetUserRoles" ur
               JOIN public."AspNetUsers" u ON u."Id" = ur."UserId"
               JOIN public."AspNetRoles" r ON r."Id" = ur."RoleId"
               WHERE u."UserName" = %s AND r."Name" = %s) = 1,
              (SELECT count(*) FROM public."AspNetUserRoles" ur
               JOIN public."AspNetUsers" u ON u."Id" = ur."UserId"
               WHERE u."UserName" = %s) = 1,
              (SELECT count(*) FROM public."AspNetUsers"
               WHERE "UserName" = %s AND "LockoutEnabled"
                 AND "LockoutEnd" IS NOT NULL
                 AND "LockoutEnd" > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')) = 0
            ''',
            ("Guest", "GUEST", "Guest", "GUEST", "Guest", "Guest", "Guest", "Guest"),
        )
        guest_checks = cursor.fetchone()
        guest_codes = (
            "guest_user",
            "guest_role",
            "guest_role_assignment",
            "guest_role_exclusive",
            "guest_not_locked",
        )
        for passed, code in zip(guest_checks, guest_codes, strict=True):
            if not passed:
                fail(code)

        cursor.execute(
            'SELECT count(*), count(DISTINCT "UserName") FROM public."AspNetUsers" '
            'WHERE "UserName" = ANY(%s)',
            (list(GAME_NIGHT_USER_NAMES),),
        )
        count, distinct_count = cursor.fetchone()
        if count != len(GAME_NIGHT_USER_NAMES) or distinct_count != len(GAME_NIGHT_USER_NAMES):
            fail("game_night_users")

        cursor.execute('SELECT count(*) FROM public."DogTimes" WHERE "Dog" NOT BETWEEN 0 AND 2')
        if cursor.fetchone()[0] != 0:
            fail("dog_enum")
        cursor.execute('SELECT count(*) FROM public."GameNightUserStatuses" WHERE "Status" NOT BETWEEN 0 AND 3')
        if cursor.fetchone()[0] != 0:
            fail("game_night_status_enum")
    STATE.table = "-"


def reset_identity_sequences(target: Any) -> None:
    STATE.stage = "identity_reset"
    with target.cursor() as cursor:
        for table in TABLES:
            for column in table.columns:
                if not column.target_identity:
                    continue
                STATE.table = table.source
                cursor.execute(
                    sql.SQL("SELECT max({}) FROM {}").format(
                        sql.Identifier(column.name),
                        sql.Identifier(table.target_schema, table.target_table),
                    )
                )
                maximum = cursor.fetchone()[0]
                next_value = 1 if maximum is None else maximum + 1
                if not 1 <= next_value <= 2_147_483_647:
                    fail("identity_range")
                relation_name = (
                    f'{table.target_schema}."{table.target_table.replace(chr(34), chr(34) * 2)}"'
                )
                cursor.execute(
                    "SELECT pg_get_serial_sequence(%s, %s)",
                    (relation_name, column.name),
                )
                sequence_reference = cursor.fetchone()[0]
                if sequence_reference is None:
                    fail("identity_sequence_missing")
                cursor.execute(
                    "SELECT setval(%s::regclass, %s, false)",
                    (sequence_reference, next_value),
                )
                cursor.execute(
                    "SELECT n.nspname, c.relname FROM pg_catalog.pg_class c "
                    "JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace "
                    "WHERE c.oid = %s::regclass AND c.relkind = 'S'",
                    (sequence_reference,),
                )
                sequence_row = cursor.fetchone()
                if sequence_row is None:
                    fail("identity_sequence_missing")
                cursor.execute(
                    sql.SQL("SELECT last_value, is_called FROM {}").format(
                        sql.Identifier(sequence_row[0], sequence_row[1])
                    )
                )
                last_value, is_called = cursor.fetchone()
                if last_value != next_value or is_called:
                    fail("identity_sequence_state")
    STATE.table = "-"


def verify_journal(target: Any, expected: tuple[str, ...]) -> None:
    STATE.stage = "journal_verify"
    with target.cursor() as cursor:
        cursor.execute('SELECT "scriptname" FROM public.schemaversions ORDER BY "scriptname"')
        if tuple(row[0] for row in cursor.fetchall()) != expected:
            fail("target_journal_changed")


def run() -> None:
    STATE.stage = "secrets"
    mysql_config = read_env_file(
        MYSQL_ENV_PATH,
        {"MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"},
        {"MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"},
    )
    postgres_config = read_env_file(
        POSTGRES_ENV_PATH,
        {
            "POSTGRES_HOST",
            "POSTGRES_PORT",
            "POSTGRES_DB",
            "POSTGRES_USER",
            "POSTGRES_PASSWORD",
            "POSTGRES_TARGET_MARKER",
        },
        {
            "POSTGRES_HOST",
            "POSTGRES_PORT",
            "POSTGRES_DB",
            "POSTGRES_USER",
            "POSTGRES_PASSWORD",
            "POSTGRES_TARGET_MARKER",
        },
    )

    source = None
    target = None
    committed = False
    try:
        STATE.stage = "source_connect"
        source = mysql.connector.connect(
            host=mysql_config["MYSQL_HOST"],
            port=parse_port(mysql_config["MYSQL_PORT"]),
            database=mysql_config["MYSQL_DATABASE"],
            user=mysql_config["MYSQL_USER"],
            password=mysql_config["MYSQL_PASSWORD"],
            charset="utf8mb4",
            use_unicode=True,
            autocommit=False,
            connection_timeout=15,
            allow_local_infile=False,
        )
        setup_cursor = source.cursor(buffered=True)
        try:
            setup_cursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")
            setup_cursor.execute("SET SESSION time_zone = '+00:00'")
            setup_cursor.execute("START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY")
        finally:
            setup_cursor.close()
        preflight_source(source, mysql_config["MYSQL_DATABASE"])

        STATE.stage = "target_connect"
        target = psycopg.connect(
            host=postgres_config["POSTGRES_HOST"],
            port=parse_port(postgres_config["POSTGRES_PORT"]),
            dbname=postgres_config["POSTGRES_DB"],
            user=postgres_config["POSTGRES_USER"],
            password=postgres_config["POSTGRES_PASSWORD"],
            connect_timeout=15,
            application_name="portfolio-etl",
            autocommit=False,
        )
        target.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        validate_target_identity(
            target,
            postgres_config["POSTGRES_DB"],
            postgres_config["POSTGRES_TARGET_MARKER"],
        )
        journal = preflight_target(target)
        validate_fresh_target(target)
        truncate_target(target)
        source_results = copy_source_to_target(source, target)
        verify_target_rows(target, source_results)
        validate_orphans(target)
        validate_application_invariants(target)
        preflight_target(target)
        verify_journal(target, journal)
        reset_identity_sequences(target)
        STATE.stage = "commit"
        STATE.table = "-"
        target.commit()
        committed = True
        total_rows = sum(result[0] for result in source_results.values())
        log(f"conversion status=complete tables={len(TABLES)} rows={total_rows}")
    finally:
        if target is not None:
            if not committed:
                try:
                    target.rollback()
                except Exception:
                    pass
            target.close()
        if source is not None:
            try:
                source.rollback()
            except Exception:
                pass
            source.close()


def main() -> int:
    try:
        run()
        return 0
    except SafeFailure as error:
        print(
            f"conversion status=failed stage={STATE.stage} table={STATE.table} code={error.code}",
            file=sys.stderr,
            flush=True,
        )
        return 1
    except mysql.connector.Error as error:
        driver_code = getattr(error, "sqlstate", None) or getattr(error, "errno", None) or "mysql"
        print(
            f"conversion status=failed stage={STATE.stage} table={STATE.table} driver=mysql code={driver_code}",
            file=sys.stderr,
            flush=True,
        )
        return 1
    except psycopg.Error as error:
        driver_code = error.sqlstate or "postgresql"
        print(
            f"conversion status=failed stage={STATE.stage} table={STATE.table} driver=postgresql code={driver_code}",
            file=sys.stderr,
            flush=True,
        )
        return 1
    except Exception:
        print(
            f"conversion status=failed stage={STATE.stage} table={STATE.table} code=unexpected",
            file=sys.stderr,
            flush=True,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
