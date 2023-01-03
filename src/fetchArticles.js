const { JSDOM } = require("jsdom");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("../react-papers-385bb320a4d0.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const batch = db.batch();
const articleRef = db.collection("articles");

function fetchArticles(start, max_results) {
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
    console.log("Setting batch request to database.");
    articles.map((article) => {
      batch.set(articleRef.doc(article.arxiv.replace(".", "-")), article);
    });
    console.log("Committing to database.");
    batch.commit();
  });
}
if (process.argv[2]) {
  const i = process.argv[2];
  console.log(`start=${i * 500} max_results=500`);
  fetchArticles(i * 500, 500);
}
