# Bitespeed Identity Reconciliation

A backend service that identifies and links customers across multiple purchases using different contact information.

## Live Endpoint
```
POST https://bitespeed-task-b8aw.onrender.com
```

## Run Locally

```bash
npm install
npm run dev
```

Server will start at `http://localhost:3000`

## API Usage

**Endpoint:** `POST /identify`

**Request:**
```json
{
  "email": "test@example.com",
  "phoneNumber": "123456"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

## Tech Stack
- Node.js + TypeScript
- Express
- SQLite (better-sqlite3)
