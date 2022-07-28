const sqlite3 = require('sqlite3').verbose();

// open the database connection
let db = new sqlite3.Database('sample.db');

db.run('CREATE TABLE categories(name text, id INTEGER PRIMARY KEY AUTOINCREMENT)');
db.run('CREATE TABLE books(ID INTEGER PRIMARY KEY AUTOINCREMENT, name text, price text, rating text)');

db.close();