import React, { useState, useEffect, useRef } from "react";

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
import dateFormat from "dateformat";

export default function ArticleSwiper(props) {
  const [articles, setArticles] = useState([]);
  const cardRefs = useRef({});
  const [isFetching, setIsFetching, hasMore, setHasMore] =
    useInfiniteScroll(fetchMoreArticles);

  useEffect(
    () => {
      if ("onLoad" in props && props.onLoad)
        props.onLoad().then(() => fetchMoreArticles(true));
      else fetchMoreArticles(true);
    },
    "folder" in props ? [props.folder] : []
  );

  function fetchMoreArticles(forceStart = false) {
    if (forceStart) setArticles([]);
    props
      .articleLoader(forceStart ? [] : articles, setArticles)
      .then((newPapers) => {
        if (!newPapers || !newPapers.length) setHasMore(false);
        setIsFetching(false);
      });
  }

  function leadingActions(article) {
    return (
      <LeadingActions>
        <SwipeAction
          destructive={true}
          onClick={() => {
            // Scroll the card into view
            if (cardRefs.current[article.arxiv]) {
              cardRefs.current[article.arxiv].scrollIntoView({ behavior: "smooth", block: "start" });
            }
            window.dispatchEvent(new Event("scroll"));
            if ("onSwipeRight" in props && props.onSwipeRight)
              return props.onSwipeRight(article);
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
            // Scroll the card into view
            if (cardRefs.current[article.arxiv]) {
              cardRefs.current[article.arxiv].scrollIntoView({ behavior: "smooth", block: "start" });
            }
            window.dispatchEvent(new Event("scroll"));
            if ("onSwipeLeft" in props && props.onSwipeLeft)
              return props.onSwipeLeft(article);
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
            ref={el => { cardRefs.current[article.arxiv] = el; }}
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
