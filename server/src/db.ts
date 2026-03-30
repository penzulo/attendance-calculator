import { Database } from "bun:sqlite";

export const db = new Database("attendance.sqlite", { create: true })

db.run("PRAGMA foreign_keys = ON;");

db.run(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    present_count INTEGER DEFAULT 0,
    total_lectures INTEGER DEFAULT 0
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    did_attend INTEGER DEFAULT 0, 
    subject_id INTEGER, 
    timestamp INTEGER,
    CONSTRAINT fk_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );
`);
