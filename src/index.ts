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
function getCluster(primaryId: number): Contact[] {
  return db
    .prepare(
      `SELECT * FROM Contact
       WHERE deletedAt IS NULL AND (id = ? OR linkedId = ?)
       ORDER BY createdAt ASC`
    )
    .all(primaryId, primaryId) as Contact[];
}
function getRootPrimary(c: Contact): Contact {
  if (c.linkPrecedence === "primary") return c;
  const parent = db
    .prepare(`SELECT * FROM Contact WHERE id = ?`)
    .get(c.linkedId) as Contact | undefined;
  if (!parent) return c;
  return getRootPrimary(parent);
}
app.post("/identify", (req, res) => {
  const { email, phoneNumber } = req.body;
  const emailVal: string | null = email ?? null;
  const phoneVal: string | null =
    phoneNumber != null ? String(phoneNumber) : null;
  if (!emailVal && !phoneVal) {
    return res.status(400).json({ error: "At least one of email or phoneNumber is required." });
  }
  const conditions: string[] = [];
  const params: (string | null)[] = [];
  if (emailVal) { conditions.push("email = ?"); params.push(emailVal); }
  if (phoneVal) { conditions.push("phoneNumber = ?"); params.push(phoneVal); }
  const matched = db
    .prepare(`SELECT * FROM Contact WHERE deletedAt IS NULL AND (${conditions.join(" OR ")})`)
    .all(...params) as Contact[];
  if (matched.length === 0) {
    const now = new Date().toISOString();
    const ins = db
      .prepare(`INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
                VALUES (?, ?, NULL, 'primary', ?, ?)`)
      .run(phoneVal, emailVal, now, now);

    return res.json({
      contact: {
        primaryContatctId: ins.lastInsertRowid,
        emails: emailVal ? [emailVal] : [],
        phoneNumbers: phoneVal ? [phoneVal] : [],
        secondaryContactIds: [],
      },
    });
  }
  res.status(501).json({ message: "merging logic coming soon" });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));