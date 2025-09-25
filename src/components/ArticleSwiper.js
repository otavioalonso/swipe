import { useState, useEffect, useRef } from "react";

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";

import useInfiniteScroll from "./InfiniteScroll";

import "react-swipeable-list/dist/styles.css";
import "./ArticleSwiper.css";

import ArticleCard from "./ArticleCard";

import dateFormat from "dateformat";

export default function ArticleSwiper(props) {
  const [articles, setArticles] = useState([]);
  const cardRefs = useRef({});
  const [focusOn, setFocusOn] = useState(null);
  const [isFetching, setIsFetching, hasMore, setHasMore] =
    useInfiniteScroll(fetchMoreArticles);

  // Scroll into view after articles update
  useEffect(() => {
    if (focusOn && cardRefs.current[focusOn]) {
      cardRefs.current[focusOn].scrollIntoView({ behavior: "smooth", block: "start" });
      setFocusOn(null);
    }
  }, [articles, focusOn]);

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
            setFocusOn(article.arxiv);
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
            setFocusOn(article.arxiv);
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
    <div className="swiper" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SwipeableList fullSwipe threshold={0.2} destructiveCallbackDelay={0}>
          {articles.map((article) => (
            <SwipeableListItem
              key={article.arxiv}
              leadingActions={leadingActions(article)}
              trailingActions={trailingActions(article)}
            >
              <div
                className="article-card-wrapper"
                ref={el => { cardRefs.current[article.arxiv] = el; }}
              >
                <ArticleCard
                  title={article.title}
                  abstract={article.abstract}
                  authors={article.authors.join(", ")}
                  arxiv={article.arxiv}
                  published={dateFormat(
                    article.published.toDate(),
                    "DDDD, mmmm d, yyyy"
                  )}
                />
              </div>
            </SwipeableListItem>
          ))}
        </SwipeableList>
        {isFetching && <div className="loader"></div>}
        {!hasMore && (
          <>
            <div className="end">
              No more articles
            </div>
          </>
        )}
      </div>
    </div>
  );
}
