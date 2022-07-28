const puppeteer = require("puppeteer");
const sqlite3 = require("sqlite3").verbose();

function addBooksToDb(bookObj) {
  // open the database connection
  let db = new sqlite3.Database("sample.db");

  let sql = `INSERT INTO books(name, price, rating) VALUES('${bookObj.name}', '${bookObj.price}', '${bookObj.rating}') `;
  db.run(sql, function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Rows inserted ${this.changes}`);
  });
  // close the database connection
  db.close();
}

function addCategoryToDb(category) {
  // open the database connection
  let db = new sqlite3.Database("sample.db");

  let sql = `INSERT INTO categories(name) VALUES('${category}') `;
  db.run(sql, function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Rows inserted ${this.changes}`);
  });
  // close the database connection
  db.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://books.toscrape.com/");

  const categoryLinks = await page.evaluate(() => {
    const booksCategories = document.querySelectorAll(
      ".side_categories ul li ul li a"
    );
    let links = {};

    booksCategories.forEach((category) => {
      console.log(category.querySelectorAll("a"));
      links[category.innerText] = category.href;
    });

    return links;
  });

  //   console.log(categoryLinks);
  let categoryBookMap = {};

  for (let category in categoryLinks) {
    addCategoryToDb(category);
    const newPage = await browser.newPage();
    try {
      await newPage.goto(categoryLinks[category]);

      const searchRcrds = await newPage.$$("section ol > li");

      let bookList = [];

      for (let i = 0; i < searchRcrds.length; i++) {
        const searchRcrd = searchRcrds[i];

        const name = await searchRcrd.$eval("h3 > a", (name) => {
          return name.textContent;
        });

        const price = await searchRcrd.$eval(
          ".price_color",
          (price) => price.textContent
        );

        const rating = await searchRcrd.$eval(".star-rating", (rating) => {
          switch (rating.className) {
            case "star-rating One":
              return 1;
            case "star-rating Two":
              return 2;
            case "star-rating Three":
              return 3;
            case "star-rating Four":
              return 4;
            case "star-rating Five":
              return 5;
          }
          return 0;
        });

        addBooksToDb({
          name: name,
          price: price,
          rating: rating,
          category: category,
        });

        bookList.push({
          name: name,
          price: price,
          rating: rating,
          category: category,
        });
      }

      categoryBookMap[category] = bookList;
    } catch (err) {
      console.error(err);
    } finally {
      await newPage.close();
    }
    break;
  }

  // console.log(categoryBookMap);

  await browser.close();
})();
