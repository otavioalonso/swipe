import { useState, useEffect } from "react";

const thresholdHeight = 50;

const useInfiniteScroll = (callback) => {
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching) return;
    if (!hasMore) {
      setIsFetching(false);
      return;
    }
    callback(() => {
      console.log("called back");
    });
  }, [isFetching]);

  function handleScroll() {
    if (
      hasMore &&
      !isFetching &&
      document.documentElement.offsetHeight -
        window.innerHeight -
        document.documentElement.scrollTop <
        thresholdHeight
    )
      setIsFetching(true);
  }

  return [isFetching, setIsFetching, hasMore, setHasMore];
};

export default useInfiniteScroll;
