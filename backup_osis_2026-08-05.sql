-- SQL Backup Dump
-- System: E-OSIS SMA Mandiri
-- Date: 8/5/2026, 1:44:24 PM

CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, password TEXT);
INSERT INTO users VALUES ('1', 'superadmin', 'hashed_pass');

-- End of Backup Dump