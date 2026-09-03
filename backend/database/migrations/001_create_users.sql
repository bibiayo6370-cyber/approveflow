CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_email_lowercase_check
        CHECK (email = LOWER(email)),
    CONSTRAINT users_role_check
        CHECK (role IN ('REQUESTER', 'APPROVER', 'FINANCE', 'ADMIN'))
);

CREATE UNIQUE INDEX users_email_unique_idx
    ON users (LOWER(email));
