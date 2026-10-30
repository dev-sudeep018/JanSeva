PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS grievances (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL CHECK(length(subject) BETWEEN 5 AND 100),
  category TEXT NOT NULL,
  area TEXT NOT NULL CHECK(length(area) BETWEEN 2 AND 100),
  description TEXT NOT NULL CHECK(length(description) BETWEEN 15 AND 1200),
  citizen_name TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted',
  priority TEXT NOT NULL DEFAULT 'Normal',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);

CREATE TABLE IF NOT EXISTS status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grievance_id TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_history_grievance ON status_history(grievance_id, id);

CREATE TABLE IF NOT EXISTS rate_limits (
  fingerprint TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (fingerprint, bucket)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at ON rate_limits(updated_at);
