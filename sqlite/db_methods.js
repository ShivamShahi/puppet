import sqlite3 from "sqlite3";
import { db } from "./get_db_conn.js";

function getCategoryId(categoryName) {
  let sel_sql = `select * from categories where name = '${categoryName}'`;
  let category_id = null;
  db.each(sel_sql, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    category_id = row.id;
  });
  return category_id;
}

export function addBooksToDb(bookObj) {
  db.get("PRAGMA foreign_keys = ON");

  let category_id = getCategoryId(bookObj.category);
  console.log(category_id); // problem, can't assign var in async method. so getting undefined here

  let sql = `INSERT INTO books(name, price, rating) VALUES('${bookObj.name}', '${bookObj.price}', '${bookObj.rating}') `;
  db.run(sql, function (err) {
    if (err) {
      return console.error(err.message);
    }
  });

  // close the database connection
}

export function addCategoryToDb(category) {
  db.get("PRAGMA foreign_keys = ON");

  let sql = `INSERT INTO categories(name) VALUES('${category}') `;
  db.run(sql, function (err) {
    if (err) {
      return console.error(err.message);
    }
  });
  // close the database connection
}
