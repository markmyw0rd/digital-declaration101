import { sql } from "@vercel/postgres";

await sql`
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student','supervisor','assessor')) NOT NULL
);
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  version TEXT
);
CREATE TABLE IF NOT EXISTS envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
  student_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT CHECK (status IN ('awaiting_student','awaiting_supervisor','awaiting_assessor','completed')) NOT NULL DEFAULT 'awaiting_student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_token TEXT,
  final_pdf_url TEXT
);
CREATE TABLE IF NOT EXISTS envelope_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID REFERENCES envelopes(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('student','supervisor','assessor')) NOT NULL,
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','signed')) NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMPTZ,
  ip TEXT,
  user_agent TEXT,
  signature_blob_url TEXT
);
CREATE TABLE IF NOT EXISTS form_data (
  envelope_id UUID PRIMARY KEY REFERENCES envelopes(id) ON DELETE CASCADE,
  json JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID REFERENCES envelopes(id) ON DELETE CASCADE,
  actor_role TEXT,
  event_type TEXT,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta JSONB
);
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID REFERENCES envelopes(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('interim','final')),
  url TEXT,
  sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;
console.log("DB ready");
process.exit(0);
