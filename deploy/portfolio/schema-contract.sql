DO $contract$
DECLARE
    missing_tables text;
    unexpected_tables text;
    actual_key_columns text;
BEGIN
    WITH expected(name) AS (
        VALUES
            ('ArchivedStarTimes'),
            ('AspNetRoleClaims'),
            ('AspNetRoles'),
            ('AspNetUserClaims'),
            ('AspNetUserLogins'),
            ('AspNetUserRoles'),
            ('AspNetUsers'),
            ('AspNetUserTokens'),
            ('BowlingFrames'),
            ('BowlingGames'),
            ('BowlingSessions'),
            ('CardCollections'),
            ('CardIds'),
            ('Courses'),
            ('DogTimes'),
            ('GameNightGameNightGame'),
            ('GameNightMeals'),
            ('GameNightUserStatuses'),
            ('GameNights'),
            ('Games'),
            ('StarTimes'),
            ('Stars'),
            ('schemaversions')
    )
    SELECT string_agg(expected.name, ', ' ORDER BY expected.name)
    INTO missing_tables
    FROM expected
    LEFT JOIN information_schema.tables actual
        ON actual.table_schema = 'public'
        AND actual.table_name = expected.name
        AND actual.table_type = 'BASE TABLE'
    WHERE actual.table_name IS NULL;

    IF missing_tables IS NOT NULL THEN
        RAISE EXCEPTION 'Missing canonical Portfolio tables: %', missing_tables;
    END IF;

    WITH expected(name) AS (
        VALUES
            ('ArchivedStarTimes'), ('AspNetRoleClaims'), ('AspNetRoles'),
            ('AspNetUserClaims'), ('AspNetUserLogins'), ('AspNetUserRoles'),
            ('AspNetUsers'), ('AspNetUserTokens'), ('BowlingFrames'),
            ('BowlingGames'), ('BowlingSessions'), ('CardCollections'),
            ('CardIds'), ('Courses'), ('DogTimes'), ('GameNightGameNightGame'),
            ('GameNightMeals'), ('GameNightUserStatuses'), ('GameNights'),
            ('Games'), ('StarTimes'), ('Stars'), ('schemaversions')
    )
    SELECT string_agg(actual.table_name, ', ' ORDER BY actual.table_name)
    INTO unexpected_tables
    FROM information_schema.tables actual
    LEFT JOIN expected ON expected.name = actual.table_name
    WHERE actual.table_schema = 'public'
      AND actual.table_type = 'BASE TABLE'
      AND expected.name IS NULL;

    IF unexpected_tables IS NOT NULL THEN
        RAISE EXCEPTION 'Unexpected Portfolio tables: %', unexpected_tables;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'legacy'
    ) THEN
        RAISE EXCEPTION 'The retired legacy schema still exists.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.schemaversions
        WHERE scriptname LIKE '%009 - Remove Legacy Schema.sql'
    ) THEN
        RAISE EXCEPTION 'The legacy-removal migration is not recorded.';
    END IF;

    SELECT string_agg(key_usage.column_name, ',' ORDER BY key_usage.ordinal_position)
    INTO actual_key_columns
    FROM information_schema.table_constraints constraints
    JOIN information_schema.key_column_usage key_usage
      ON key_usage.constraint_schema = constraints.constraint_schema
     AND key_usage.constraint_name = constraints.constraint_name
     AND key_usage.table_schema = constraints.table_schema
     AND key_usage.table_name = constraints.table_name
    WHERE constraints.table_schema = 'public'
      AND constraints.table_name = 'CardIds'
      AND constraints.constraint_type = 'PRIMARY KEY';

    IF actual_key_columns IS DISTINCT FROM 'Id,Section,CardCollectionId' THEN
        RAISE EXCEPTION
            'CardIds primary key is %, expected Id,Section,CardCollectionId.',
            COALESCE(actual_key_columns, '<missing>');
    END IF;

    SELECT string_agg(key_usage.column_name, ',' ORDER BY key_usage.ordinal_position)
    INTO actual_key_columns
    FROM information_schema.table_constraints constraints
    JOIN information_schema.key_column_usage key_usage
      ON key_usage.constraint_schema = constraints.constraint_schema
     AND key_usage.constraint_name = constraints.constraint_name
     AND key_usage.table_schema = constraints.table_schema
     AND key_usage.table_name = constraints.table_name
    WHERE constraints.table_schema = 'public'
      AND constraints.table_name = 'DogTimes'
      AND constraints.constraint_type = 'PRIMARY KEY';

    IF actual_key_columns IS DISTINCT FROM 'Dog,Timestamp' THEN
        RAISE EXCEPTION
            'DogTimes primary key is %, expected Dog,Timestamp.',
            COALESCE(actual_key_columns, '<missing>');
    END IF;

    IF EXISTS (
        SELECT expected.table_name
        FROM (
            VALUES ('AspNetRoleClaims'), ('AspNetUserClaims')
        ) AS expected(table_name)
        LEFT JOIN information_schema.columns actual
          ON actual.table_schema = 'public'
         AND actual.table_name = expected.table_name
         AND actual.column_name = 'Id'
         AND actual.is_identity = 'YES'
         AND actual.identity_generation = 'BY DEFAULT'
        WHERE actual.column_name IS NULL
    ) THEN
        RAISE EXCEPTION
            'ASP.NET claim identifiers must be generated by-default identity columns.';
    END IF;
END
$contract$;
