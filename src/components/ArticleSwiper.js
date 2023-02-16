import React, { useState, useEffect } from "react";

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
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase.js";

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";

import useInfiniteScroll from "./InfiniteScroll";

import "react-swipeable-list/dist/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import "./ArticleSwiper.css";

import ArticleCard from "./ArticleCard";
import dateFormat from "dateformat";

const cardsPerScroll = 10;
const arxivQuery =
  "https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&max_results=100";

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export default function ArticleSwiper(props) {
  const [articles, setArticles] = useState([]);
  const [isFetching, setIsFetching, hasMore, setHasMore] =
    useInfiniteScroll(fetchMoreArticles);

  const { currentUser } = useAuth();

  useEffect(() => {
    importNewArticles().then(fetchMoreArticles);
  }, []);

  function fetchMoreArticles() {
    let query_array = [collection(db, "users", currentUser.uid, "inbox")];
    query_array.push(limit(cardsPerScroll));
    query_array.push(orderBy("arxiv", "desc"));
    if (articles.length) query_array.push(startAfter(articles.at(-1).arxiv));

    getDocs(query(...query_array)).then((response) => {
      if (response.empty) {
        setHasMore(false);
      } else {
        setArticles((prev) => [
          ...(articles.length ? prev : []),
          ...response.docs.map((d) => d.data()),
        ]);
      }
      setIsFetching(false);
    });
  }

  function importNewArticles() {
    props.logger("Checking new articles.");
    return new Promise(function (resolve) {
      const userDoc = doc(db, "users", currentUser.uid);

      getDoc(userDoc).then((userRes) => {
        let user;

        if (userRes.exists() && "lastAdded" in userRes.data()) {
          user = userRes.data();
        } else {
          // If user doesn't exist, it will be created later
          user = { lastAdded: new Date(0) };
        }

        let query_array = [];
        query_array.push(collection(db, "articles"));
        query_array.push(orderBy("arxiv", "desc"));
        query_array.push(where("arxiv", ">", user.lastAdded));
        query_array.push(limit(500));

        // TODO: split in chunks of size 500
        getDocs(query(...query_array)).then((res) => {
          if (res.empty) {
            props.logger("No new articles found.");
            resolve([]);
          } else {
            const batch = writeBatch(db);
            const articles = res.docs.map((e) => e.data());
            props.logger(
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
            props.logger("Done.");
            resolve(articles);
          }
        });

        // Updating lastUpdate tag to now
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

  function archiveArticle(article) {
    addArticle(article, "archive");
    deleteArticle(article, "inbox");
    props.logger(`Archived ${article.arxiv}.`);
  }

  function discardArticle(article) {
    deleteArticle(article, "inbox");
    props.logger(`Discarded ${article.arxiv}.`);
  }

  function leadingActions(article) {
    return (
      <LeadingActions>
        <SwipeAction
          destructive={true}
          onClick={() => {
            window.dispatchEvent(new Event("scroll"));
            return archiveArticle(article);
          }}
        >
          <span></span>
        </SwipeAction>
      </LeadingActions>
    );
  }

  function trailingActions(article) {
    return (
      <TrailingActions>
        <SwipeAction
          destructive={true}
          onClick={() => {
            window.dispatchEvent(new Event("scroll"));
            return discardArticle(article);
          }}
        >
          <span></span>
        </SwipeAction>
      </TrailingActions>
    );
  }

  return (
    <>
      <SwipeableList fullSwipe threshold={0.2}>
        {articles.map((article) => (
          <SwipeableListItem
            key={article.arxiv}
            leadingActions={leadingActions(article)}
            trailingActions={trailingActions(article)}
          >
            <ArticleCard
              title={article.title}
              abstract={article.abstract}
              avatar={
                "https://static.vecteezy.com/system/resources/previews/004/980/452/non_2x/astrophysics-blue-violet-flat-design-long-shadow-glyph-icon-astronomy-branch-study-of-universe-stars-planets-galaxies-astrophysical-discoveries-cosmology-silhouette-illustration-vector.jpg"
              }
              authors={article.authors.join(", ")}
              arxiv={article.arxiv}
              published={dateFormat(
                article.published.toDate(),
                "DDDD, mmmm d, yyyy"
              )}
            />
          </SwipeableListItem>
        ))}
      </SwipeableList>
      {isFetching && <div className="loader"></div>}
      {!hasMore && (
        <>
          <div className="end" style={{ color: "#aaa" }}>
            No more articles
          </div>
        </>
      )}
    </>
  );
}
