const functions = require("firebase-functions");
const {onMessagePublished} = require("firebase-functions/v2/pubsub");

const { JSDOM } = require("jsdom");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.arxivupdate = onMessagePublished({
    topic: "arxiv-updates",
    minInstances: 0,
    maxInstances: 1,
    concurrency: 1,
    cpu: 1,
    memory: "256MB",
    timeoutSeconds: 60,
    region: "us-central1",
    onTimeout: () => {
        functions.logger.info(`arXiv update timed out.`);
    },
    onFailure: () => {
        functions.logger.info(`arXiv update failed.`);
    },
},
(event) => {
    getFirestore().collection("articles")
                  .orderBy("arxiv", "desc")
                  .limit(1)
                  .get().then((res) => {
        const latestPaper = res.docs[0].data();
        functions.logger.info(`Most recent article in the database is ${latestPaper.arxiv}.`);
        // filter papers more recent than latest in the articles collection and add them
        fetchArxiv(0, 100).then((articles) => {
        const articlesToAdd = res.empty
            ? articles
            : articles.filter((article) => article.arxiv > latestPaper.arxiv);

            functions.logger.info(`${articlesToAdd.length} articles are new.`);
        uploadArticles(articlesToAdd);
        });
    });
    return null;
  });

function fetchArxiv(start, max_results) {
  return new Promise((resolve) => {
    const arxivQuery = `https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&start=${start}&max_results=${max_results}`;
    functions.logger.info(`Fetching ${max_results} articles from arXiv.`);
    functions.logger.info(arxivQuery);
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
      functions.logger.info(`Got ${articles.length} articles.`);
      resolve(articles);
    });
  });
}

function uploadArticles(articles) {
    return new Promise((resolve) => {
        const batch = getFirestore().batch();
        functions.logger.info(`Uploading articles to database.`);
        articles.map((article) => {
            batch.set(getFirestore().collection("articles").doc(article.arxiv.replace(".", "-")), article);
        });
        batch.commit();
        functions.logger.info(`Articles uploaded successfully.`);
        resolve();
    });
}
