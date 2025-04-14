
CREATE schema privacy;
CREATE schema common;
-- Create table 'role'




-- Step 3: Create the Table with Updated Schema
CREATE TABLE privacy.auth (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                            status SMALLINT NOT NULL DEFAULT 0,
                            login_type SMALLINT NOT NULL DEFAULT 1,
                            email VARCHAR(256) NULL,
                            password VARCHAR(256) NULL,
                            user_name VARCHAR(256) NULL,
                            role SMALLINT NOT NULL , -- Cast the default value to Role
                            last_login_at TIMESTAMP NULL,
                            ip_address VARCHAR(64) NULL,
                            user_agent TEXT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE common.organisation (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                                     name VARCHAR(256) NOT NULL,
                                     address VARCHAR(512) NULL,
                                     email VARCHAR(256) NOT NULL,
                                     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE common.user (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                             auth_id UUID NOT NULL ,
                             profile_image_url VARCHAR(512) NULL,
                             first_name VARCHAR(128) NOT NULL,
                             last_name VARCHAR(128) NOT NULL,
                             location VARCHAR(128) NULL,
                             phone_number VARCHAR(15) NULL,
                             organisation_id UUID NULL ,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE common.file (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                             file_name VARCHAR(256) NULL,
                             organisation_id UUID NOT NULL ,
                             uploaded_by UUID NOT NULL ,
                             uploaded_at TIMESTAMPTZ NOT NULL,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE common.question_suggestion (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                            is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                                            title VARCHAR(256) NOT NULL,
                                            description TEXT NULL,
                                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE chat_room (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                           title VARCHAR(256) NOT NULL,
                           description TEXT NULL,
                           user_id UUID NOT NULL,
                           created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE common.message (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                is_valid BOOLEAN NOT NULL DEFAULT TRUE,
                                room_id UUID NOT NULL ,
                                is_file BOOLEAN NOT NULL DEFAULT FALSE,
                                file_url VARCHAR(512) NULL,
                                content TEXT NULL,
                                is_user BOOLEAN NOT NULL DEFAULT TRUE,
                                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE privacy.token_history (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Primary key with UUID generation
                                     is_valid BOOLEAN DEFAULT false,               -- Boolean column with a default value
                                     device_id UUID,                               -- Nullable UUID column
                                     auth_id UUID NOT NULL,                        -- UUID column (non-null)
                                     refresh_token VARCHAR(1000) NOT NULL,         -- String column with a maximum length of 1000
                                     created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Auto-generated creation timestamp
                                     updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Auto-generated update timestamp
);
CREATE TABLE privacy.custom_token (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Primary key with UUID generation
                                    is_valid BOOLEAN DEFAULT false,               -- Boolean column with a default value
                                    is_used BOOLEAN DEFAULT false,                -- Boolean column with a default value
                                    token TEXT NOT NULL,                          -- Text column for token
                                    auth_id UUID NOT NULL,                        -- UUID column (non-null)
                                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Auto-generated creation timestamp
                                    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Auto-generated update timestamp
);


ALTER TABLE common.user DROP COLUMN IF EXISTS title;
ALTER TABLE common.user ADD COLUMN IF NOT EXISTS location VARCHAR(128) NULL;