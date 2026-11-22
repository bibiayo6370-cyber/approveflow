CREATE TABLE request_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests (id),
    actor_id UUID NOT NULL REFERENCES users (id),
    event_type VARCHAR(30) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT request_events_type_check CHECK (event_type IN ('REQUEST_CREATED', 'REQUEST_SUBMITTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED'))
);

CREATE INDEX request_events_request_created_idx ON request_events (request_id, created_at);

CREATE FUNCTION prevent_request_event_mutation() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'request_events are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER request_events_append_only
BEFORE UPDATE OR DELETE ON request_events
FOR EACH ROW EXECUTE FUNCTION prevent_request_event_mutation();
