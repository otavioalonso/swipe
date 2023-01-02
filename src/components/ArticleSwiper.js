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
  setDoc,
  deleteDoc,
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

const cardsPerScroll = 10;
const arxivQuery =
  "https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&max_results=100";

export default function ArticleSwiper() {
  const [articles, setArticles] = useState([]);
  const [isFetching, setIsFetching, hasMore, setHasMore] =
    useInfiniteScroll(fetchMoreArticles);

  const { currentUser } = useAuth();

  useEffect(() => {
    fetchMoreArticles();
  }, []);

  function fetchMoreArticles() {
    getDocs(
      query(
        collection(db, "users", currentUser.uid, "inbox"),
        limit(cardsPerScroll),
        orderBy("arxiv"),
        startAfter(articles.length ? articles.at(-1).arxiv : null)
      )
    ).then((res) => {
      if (res.empty) {
        setHasMore(false);
      } else {
        setArticles((prev) => [
          ...(articles.length ? prev : []),
          ...res.docs.map((d) => d.data()),
        ]);
      }
      setIsFetching(false);
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

  function importNewArticles() {
    setHasMore(true);
    setArticles([]);
    return fetch(arxivQuery).then((res) => {
      res.text().then((content) => {
        const xml = new window.DOMParser().parseFromString(content, "text/xml");
        const articles = [...xml.querySelectorAll("entry")].map((entry) => ({
          arxiv: entry.querySelector("id").innerHTML.match(/\d{4}\.\d{3,6}/)[0],
          title: entry.querySelector("title").innerHTML.trim(),
          abstract: entry.querySelector("summary").innerHTML.trim(),
          authors: [...entry.querySelectorAll("author")]
            .map((author) => author.querySelector("name").innerHTML.trim())
            .join(", "),
          avatar:
            "https://static.vecteezy.com/system/resources/previews/004/980/452/non_2x/astrophysics-blue-violet-flat-design-long-shadow-glyph-icon-astronomy-branch-study-of-universe-stars-planets-galaxies-astrophysical-discoveries-cosmology-silhouette-illustration-vector.jpg",
        }));
        console.log("Importing articles", articles);
        articles.map((article) => {
          addArticle(article, "inbox");
        });
        fetchMoreArticles();
        return articles;
      });
    });
  }

  function archiveArticle(article) {
    addArticle(article, "archive");
    deleteArticle(article, "inbox");
  }

  function discardArticle(article) {
    deleteArticle(article, "inbox");
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
              avatar={article.avatar}
              authors={article.authors}
            />
          </SwipeableListItem>
        ))}
      </SwipeableList>
      {isFetching && <div className="loader"></div>}
      {!hasMore && (
        <>
          <div className="end" style={{ color: "#aaa" }}>
            No more papers
          </div>
          <Button onClick={importNewArticles} className="end">
            Import more papers
          </Button>
        </>
      )}
    </>
  );
}
