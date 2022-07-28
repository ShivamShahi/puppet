import { launch } from "puppeteer";
import { addBooksToDb } from "../sqlite/db_methods.js";
import { addCategoryToDb } from "../sqlite/db_methods.js";


(async () => {
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://books.toscrape.com/");

  const categoryLinks = await page.evaluate(() => {
    const booksCategories = document.querySelectorAll(
      ".side_categories ul li ul li a"
    );
    let links = {};

    booksCategories.forEach((category) => {
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
          category: category.toString(),
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
