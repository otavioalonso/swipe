import React, { useState, useEffect } from "react";
// import { set, get, ref, onValue, remove, update } from "firebase/database";
import {
  doc,
  getDocs,
  collection,
  query,
  orderBy,
  startAfter,
  limit,
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
import "./ArticleSwiper.css";

import ArticleCard from "./ArticleCard";

const cardsPerScroll = 2;

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
          ...res.docs.map((d) => ({ id: d.id, ...d.data() })),
        ]);
      }
      setIsFetching(false);
    });
  }

  function deleteArticle(arxiv_number) {
    // const aid = arxiv_number.replace(".", "-");
    // console.log("removing", aid);
    // remove(ref(db, `/feed/${currentUser.uid}/inbox/${aid}`));
  }

  function moveRef(oldRef, newRef) {
    // get(oldRef).then((snap) => {
    //   if (snap.exists()) {
    //     set(newRef, snap.val());
    //     remove(oldRef);
    //   }
    // });
  }

  function archiveArticle(arxiv_number) {
    // const aid = arxiv_number.replace(".", "-");
    // console.log("saving", arxiv_number);
    // moveRef(
    //   ref(db, `/feed/${currentUser.uid}/inbox/${aid}`),
    //   ref(db, `/feed/${currentUser.uid}/archive/${aid}`)
    // );
  }

  function leadingActions(e) {
    return (
      <LeadingActions>
        <SwipeAction
          destructive={true}
          onClick={() => {
            window.dispatchEvent(new Event("scroll"));
            return archiveArticle(e.id);
          }}
        >
          <span></span>
        </SwipeAction>
      </LeadingActions>
    );
  }

  function trailingActions(e) {
    return (
      <TrailingActions>
        <SwipeAction
          destructive={true}
          onClick={() => {
            window.dispatchEvent(new Event("scroll"));
            return deleteArticle(e.id);
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
            key={article.id}
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
      {!hasMore && <div className="end">No more papers</div>}
    </>
  );
}
