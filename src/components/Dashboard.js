import React, { useState } from "react";

import {
  doc,
  getDocs,
  getDoc,
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  writeBatch,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";

import NavBar from "./NavBar";
import ArticleSwiper from "./ArticleSwiper";

import { useAuth } from "../contexts/AuthContext";
import { useLog } from "../contexts/LogContext";

const cardsPerScroll = 10;

export default function Dashboard({ folder }) {
  const { currentUser } = useAuth();
  const { log } = useLog();

  const [currentFolder, setCurrentFolder] = useState(folder);

  const articleRef = collection(db, "articles");

  function fetchArxiv(start, max_results) {
    return new Promise((resolve) => {
      log("Fetching papers from arXiv.");
      const arxivQuery = `https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&start=${start}&max_results=${max_results}`;
      log(arxivQuery);

      fetch(arxivQuery).then((response) => {
        response.text().then((content) => {
          const xml = new window.DOMParser().parseFromString(
            content,
            "text/xml"
          );

          const articles = [...xml.querySelectorAll("entry")].map((entry) => ({
            arxiv: entry
              .querySelector("id")
              .innerHTML.match(/\d{4}\.\d{3,6}/)[0],
            title: entry.querySelector("title").innerHTML.trim(),
            abstract: entry.querySelector("summary").innerHTML.trim(),
            authors: [...entry.querySelectorAll("author")].map((author) =>
              author.querySelector("name").innerHTML.trim()
            ),
            published: new Date(entry.querySelector("published").innerHTML),
            updated: new Date(entry.querySelector("updated").innerHTML),
            added: new Date(Date.now()),
            categories: [...entry.querySelectorAll("category")].map(
              (category) => category.getAttribute("term")
            ),
            category: entry
              .querySelector("primary_category")
              .getAttribute("term"),
            comment: entry.querySelector("comment")
              ? entry.querySelector("comment").innerHTML
              : "",
          }));
          log(
            `Obtained ${articles.length} articles (${
              articles.slice(-1)[0].arxiv
            } to ${articles[0].arxiv}).`
          );

          resolve(articles);
        });
      });
    });
  }

  function uploadArticles(articles) {
    return new Promise((resolve) => {
      log(`Uploading ${articles.length} papers to database.`);
      try {
        let batch = writeBatch(db);
        articles.map((article) => {
          batch.set(doc(articleRef, article.arxiv.replace(".", "-")), article);
        });
        batch.commit();
        log(`Done.`);
      } catch (err) {
        log(`Error: ${err}`);
      }
      resolve();
    });
  }

  function importArxiv() {
    // setup query to get the latest paper in the articles collection
    let query_array = [];
    query_array.push(collection(db, "articles"));
    query_array.push(orderBy("arxiv", "desc"));
    query_array.push(limit(1));

    getDocs(query(...query_array)).then((res) => {
      const latestPaper = res.docs[0].data();
      log(`Most recent article in the database is ${latestPaper.arxiv}.`);
      // filter papers more recent than latest in the articles collection and add them
      fetchArxiv(0, 100).then((articles) => {
        const articlesToAdd = res.empty
          ? articles
          : articles.filter((article) => article.arxiv > latestPaper.arxiv);

        log(`${articlesToAdd.length} articles are new.`);
        uploadArticles(articlesToAdd);
      });
    });
  }

  function addNewArticles() {
    log("Checking new articles.");
    return new Promise((resolve) => {
      const userDoc = doc(db, "users", currentUser.uid);

      getDoc(userDoc).then((userRes) => {
        let user;

        if (userRes.exists() && "lastAdded" in userRes.data()) {
          user = userRes.data();
        } else {
          // If user doesn't exist, it will be created later
          user = { lastAdded: "0000.00000" };
          log("User not in database.");
        }

        let query_array = [];
        query_array.push(collection(db, "articles"));
        query_array.push(orderBy("arxiv", "desc"));
        query_array.push(where("arxiv", ">", user.lastAdded));
        query_array.push(limit(500));

        // TODO: split in chunks of size 500
        getDocs(query(...query_array)).then((res) => {
          if (res.empty) {
            log("No new articles found.");
            resolve([]);
          } else {
            const batch = writeBatch(db);
            const articles = res.docs.map((e) => e.data());
            log(
              `Found ${articles.length} new articles! Adding them to my inbox.`
            );

            articles.map((article) => {
              batch.set(
                doc(
                  db,
                  "users",
                  currentUser.uid,
                  "inbox",
                  article.arxiv.replace(".", "-")
                ),
                article
              );
            });
            batch.commit();
            user.lastAdded = articles[0].arxiv;
            setDoc(userDoc, user);
            log("Done.");
            resolve(articles);
          }
        });
      });
    });
  }

  function addArticle(article, folder) {
    setDoc(
      doc(
        db,
        "users",
        currentUser.uid,
        folder,
        article.arxiv.replace(".", "-")
      ),
      article
    );
  }

  function deleteArticle(article, folder) {
    deleteDoc(
      doc(db, "users", currentUser.uid, folder, article.arxiv.replace(".", "-"))
    );
  }

  function moveArticle(article, from, to) {
    addArticle(article, to);
    deleteArticle(article, from);
  }

  function getArticleLoader(articles, setArticles) {
    return new Promise((resolve) => {
      let query_array = [
        collection(db, "users", currentUser.uid, currentFolder),
      ];
      query_array.push(limit(cardsPerScroll));
      query_array.push(orderBy("arxiv", "desc"));
      if (articles.length) {
        query_array.push(startAfter(articles.at(-1).arxiv));
      }

      getDocs(query(...query_array)).then((response) => {
        let newPapers;
        if (response.empty) {
          newPapers = [];
        } else {
          newPapers = response.docs.map((d) => d.data());
          setArticles((prev) => [
            ...(articles.length ? prev : []),
            ...newPapers,
          ]);
        }
        resolve(newPapers);
      });
    });
  }

  return (
    <>
      <NavBar
        folder={currentFolder}
        setFolder={setCurrentFolder}
      />
      <ArticleSwiper
        articleLoader={getArticleLoader}
        folder={currentFolder}
        onLoad={currentFolder === "inbox" && addNewArticles}
        onSwipeLeft={
          ["inbox", "archive"].includes(currentFolder) &&
          ((article) => moveArticle(article, currentFolder, "trash"))
        }
        onSwipeRight={
          ["inbox", "trash"].includes(currentFolder) &&
          ((article) => moveArticle(article, currentFolder, "archive"))
        }
      />
    </>
  );
}
