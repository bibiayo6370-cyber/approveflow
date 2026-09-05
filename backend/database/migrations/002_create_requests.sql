CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(14, 2) NOT NULL,
    total_cost NUMERIC(14, 2) NOT NULL,
    required_date DATE NOT NULL,
    justification TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT requests_quantity_positive_check
        CHECK (quantity > 0),

    CONSTRAINT requests_unit_cost_positive_check
        CHECK (unit_cost > 0),

    CONSTRAINT requests_total_cost_positive_check
        CHECK (total_cost > 0),

    CONSTRAINT requests_status_check
        CHECK (
            status IN (
                'DRAFT',
                'PENDING_APPROVAL',
                'APPROVED',
                'REJECTED',
                'PROCESSED'
            )
        ),

    CONSTRAINT requests_created_by_fk
        FOREIGN KEY (created_by)
        REFERENCES users (id)
);
