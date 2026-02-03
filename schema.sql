-- =============================================
-- Cow Management System - Database Schema
-- =============================================

-- =============================================
-- LOOKUP / REFERENCE TABLES (No Foreign Keys)
-- =============================================

-- AI Status lookup table
CREATE TABLE ai_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Calf Status lookup table
CREATE TABLE calf_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Colors lookup table
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Cow Gender lookup table
CREATE TABLE cow_gender (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Cow Role lookup table
CREATE TABLE cow_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Cow Status lookup table
CREATE TABLE cow_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Feedlots table
CREATE TABLE feedlots (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Inseminators table
CREATE TABLE inseminators (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- PD (Pregnancy Diagnosis) Status lookup table
CREATE TABLE pd_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    remark TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Semen table
CREATE TABLE semen (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    sire_id VARCHAR,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    straw INTEGER,
    bull BOOLEAN,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    admin BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MAIN TABLES (With Foreign Keys)
-- =============================================

-- Transponders table
CREATE TABLE transponders (
    id SERIAL PRIMARY KEY,
    code VARCHAR NOT NULL,
    current_cow INTEGER,
    current_feedlot INTEGER REFERENCES feedlots(id),
    assigned_date DATE,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Cows table
CREATE TABLE cows (
    id SERIAL PRIMARY KEY,
    tag VARCHAR NOT NULL,
    gender INTEGER NOT NULL REFERENCES cow_gender(id),
    dob DATE,
    weight NUMERIC,
    color INTEGER REFERENCES colors(id),
    role INTEGER REFERENCES cow_role(id),
    status INTEGER REFERENCES cow_status(id),
    dam_id INTEGER,
    semen_id INTEGER REFERENCES semen(id),
    current_feedlot_id INTEGER REFERENCES feedlots(id),
    current_transponder_id INTEGER REFERENCES transponders(id),
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Add self-referencing foreign key for cows
ALTER TABLE cows ADD CONSTRAINT cows_dam_id_fkey FOREIGN KEY (dam_id) REFERENCES cows(id);

-- Add foreign key for transponders referencing cows (circular dependency)
ALTER TABLE transponders ADD CONSTRAINT transponder_current_cow_fkey FOREIGN KEY (current_cow) REFERENCES cows(id);

-- AI Records table
CREATE TABLE ai_records (
    id SERIAL PRIMARY KEY,
    code VARCHAR,
    dam_id INTEGER NOT NULL REFERENCES cows(id),
    semen_id INTEGER NOT NULL REFERENCES semen(id),
    feedlot_id INTEGER REFERENCES feedlots(id),
    ai_by INTEGER REFERENCES inseminators(id),
    prepared_by INTEGER REFERENCES inseminators(id),
    status INTEGER REFERENCES ai_status(id),
    date DATE,
    ai_date DATE,
    ai_time TIME,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Cow Feedlot History table
CREATE TABLE cow_feedlot_history (
    id SERIAL PRIMARY KEY,
    cow_id INTEGER NOT NULL REFERENCES cows(id),
    feedlot_id INTEGER NOT NULL REFERENCES feedlots(id),
    moved_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    moved_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Cow Transponder History table
CREATE TABLE cow_transponder_history (
    id SERIAL PRIMARY KEY,
    cow_id INTEGER NOT NULL REFERENCES cows(id),
    transponder_id INTEGER NOT NULL REFERENCES transponders(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Pregnancy Diagnosis table
CREATE TABLE pregnancy_diagnosis (
    id SERIAL PRIMARY KEY,
    ai_record_id INTEGER NOT NULL REFERENCES ai_records(id),
    ai_date DATE NOT NULL,
    diagnosis_by INTEGER REFERENCES inseminators(id),
    pd_status INTEGER REFERENCES pd_status(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Calf Record table
CREATE TABLE calf_record (
    id SERIAL PRIMARY KEY,
    cow_id INTEGER NOT NULL REFERENCES cows(id),
    ai_record_id INTEGER NOT NULL REFERENCES ai_records(id),
    pd_id INTEGER NOT NULL REFERENCES pregnancy_diagnosis(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- Transponder Records table
CREATE TABLE transponder_records (
    id SERIAL PRIMARY KEY,
    transponder_id INTEGER NOT NULL REFERENCES transponders(id),
    cow_id INTEGER REFERENCES cows(id),
    feedlot_id INTEGER REFERENCES feedlots(id),
    assigned_date DATE NOT NULL,
    leave_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ,
    updated_by UUID
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get email by phone number
CREATE OR REPLACE FUNCTION get_email_by_phone(phone_number VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN (SELECT email FROM users WHERE phone = phone_number LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDEXES (for better query performance)
-- =============================================

CREATE INDEX idx_cows_tag ON cows(tag);
CREATE INDEX idx_cows_current_feedlot ON cows(current_feedlot_id);
CREATE INDEX idx_cows_dam ON cows(dam_id);
CREATE INDEX idx_ai_records_dam ON ai_records(dam_id);
CREATE INDEX idx_ai_records_feedlot ON ai_records(feedlot_id);
CREATE INDEX idx_ai_records_date ON ai_records(ai_date);
CREATE INDEX idx_transponders_code ON transponders(code);
CREATE INDEX idx_transponder_records_transponder ON transponder_records(transponder_id);
CREATE INDEX idx_calf_record_cow ON calf_record(cow_id);
CREATE INDEX idx_pregnancy_diagnosis_ai_record ON pregnancy_diagnosis(ai_record_id);
CREATE INDEX idx_cow_feedlot_history_cow ON cow_feedlot_history(cow_id);
CREATE INDEX idx_cow_transponder_history_cow ON cow_transponder_history(cow_id);
