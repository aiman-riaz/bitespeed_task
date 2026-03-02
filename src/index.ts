import express from "express";
import Database from "better-sqlite3";
import path from "path";

const app = express();
app.use(express.json());
const db = new Database(path.join(__dirname, "../contacts.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS Contact (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    phoneNumber     TEXT,
    email           TEXT,
    linkedId        INTEGER,
    linkPrecedence  TEXT NOT NULL CHECK(linkPrecedence IN ('primary','secondary')),
    createdAt       DATETIME NOT NULL,
    updatedAt       DATETIME NOT NULL,
    deletedAt       DATETIME
  )
`);

interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: "primary" | "secondary";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));