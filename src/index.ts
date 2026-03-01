import express from "express";
import Database from "better-sqlite3";
import path from "path";

const app = express();
app.use(express.json());