const { JSDOM } = require("jsdom");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("../react-papers-385bb320a4d0.json");
// const { upload } = require("@testing-library/user-event/dist/upload");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const batch = db.batch();
const articleRef = db.collection("articles");

function fetchArticles(start, max_results) {
  return new Promise((resolve) => {
    const arxivQuery = `https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&start=${start}&max_results=${max_results}`;
    console.log(arxivQuery);
    JSDOM.fromURL(arxivQuery).then((dom) => {
      const xml = dom.window.document;
      const articles = [...xml.querySelectorAll("entry")].map((entry) => ({
        arxiv: entry.querySelector("id").innerHTML.match(/\d{4}\.\d{3,6}/)[0],
        title: entry.querySelector("title").innerHTML.trim(),
        abstract: entry.querySelector("summary").innerHTML.trim(),
        authors: [...entry.querySelectorAll("author")].map((author) =>
          author.querySelector("name").innerHTML.trim()
        ),
        published: new Date(entry.querySelector("published").innerHTML),
        updated: new Date(entry.querySelector("updated").innerHTML),
        added: new Date(Date.now()),
        categories: [...entry.querySelectorAll("category")].map((category) =>
          category.getAttribute("term")
        ),
        category: entry
          .querySelector("arxiv\\:primary_category")
          .getAttribute("term"),
        comment: entry.querySelector("arxiv\\:comment")
          ? entry.querySelector("arxiv\\:comment").innerHTML
          : "",
      }));
      console.log(`Fetched ${articles.length} articles.`);
      resolve(articles);
    });
  });
}

function uploadArticles(articles) {
  return new Promise((resolve) => {
    console.log(`Uploading papers to database.`);
    articles.map((article) => {
      batch.set(articleRef.doc(article.arxiv.replace(".", "-")), article);
    });
    batch.commit();
    console.log(`Done.`);
    resolve();
  });
}

fetchArticles(0, 500).then((articles) => uploadArticles(articles));
