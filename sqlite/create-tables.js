import sqlite3 from "sqlite3";
let db = new sqlite3.Database("sample.db");

function createDb() {
  db.get("PRAGMA foreign_keys = ON");

  db.run(
    "CREATE TABLE categories(name text unique, id INTEGER PRIMARY KEY AUTOINCREMENT)"
  );
  db.run(
    "CREATE TABLE books(ID INTEGER PRIMARY KEY AUTOINCREMENT, name text, price text, rating text, categoryId INTEGER, FOREIGN KEY(categoryId) REFERENCES categories(id))"
  );

  db.close();
}

createDb();
