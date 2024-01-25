const functions = require("firebase-functions");
const {onMessagePublished} = require("firebase-functions/v2/pubsub");

const { JSDOM } = require("jsdom");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const NUM_ARTICLES_ARXIV_FETCH = 100;

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
        functions.logger.info(`arxivupdate: update timed out.`);
    },
    onFailure: () => {
        functions.logger.info(`arxivupdate: update failed.`);
    },
},
(event) => {
    getFirestore().collection("articles")
                  .orderBy("arxiv", "desc")
                  .limit(1)
                  .get().then((res) => {
        const latestPaper = res.docs[0].data();
        functions.logger.info(`arxivupdate: most recent article in the database is ${latestPaper.arxiv}.`);
        // filter papers more recent than latest in the articles collection and add them
        fetchArxiv(0, NUM_ARTICLES_ARXIV_FETCH).then((articles) => {
          functions.logger.info(`arxivupdate: comparing ${latestPaper.arxiv} to (${articles.slice(-1)[0].arxiv}, ${articles[0].arxiv})`)
          const articlesToAdd = res.empty
              ? articles
              : articles.filter((article) => article.arxiv > latestPaper.arxiv);

              if (articlesToAdd.length >= NUM_ARTICLES_ARXIV_FETCH) {
                functions.logger.warn(`arxivupdate: NUM_ARTICLES_ARXIV_FETCH (= ${NUM_ARTICLES_ARXIV_FETCH}) or more new articles found in arXiv. Some might have been missed.`);
              } else {
                functions.logger.info(`arxivupdate: ${articlesToAdd.length} articles are new.`);
            }
              
          uploadArticles(articlesToAdd);
        });
    });
    return null;
  });

function fetchArxiv(start, max_results) {
  return new Promise((resolve) => {
    const arxivQuery = `https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&start=${start}&max_results=${max_results}`;
    functions.logger.info(`fetchArxiv: fetching ${max_results} articles from arXiv.`);
    functions.logger.info(`fetchArxiv: ${arxivQuery}`);
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
      functions.logger.info(`fetchArxiv: got ${articles.length} articles (${articles.slice(-1)[0].arxiv} to ${articles[0].arxiv}).`);
      resolve(articles);
    });
  });
}

function uploadArticles(articles) {
    return new Promise((resolve) => {
      functions.logger.info(`uploadArticles: uploading articles to database.`);
      try {
        let batch = getFirestore().batch();
        articles.map((article) => {
            batch.set(getFirestore().collection("articles").doc(article.arxiv.replace(".", "-")), article);
        });
        batch.commit();
        functions.logger.info(`uploadArticles: articles uploaded successfully.`);
      } catch (err) {
        functions.logger.error(`uploadArticles: error while uploading articles: ${err}`);
      }
        resolve();
    });
}