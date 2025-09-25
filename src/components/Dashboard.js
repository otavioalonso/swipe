import { useState, useRef, useEffect } from "react";

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

import "./ArticleSwiper.css";

const cardsPerScroll = 10;

export default function Dashboard({ folder }) {
  const { currentUser } = useAuth();
  const { log } = useLog();
  const canvasRef = useRef(null);

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const [currentFolder, setCurrentFolder] = useState(folder);


    // Draw 10 PRINT pattern on canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      // Set canvas size to match parent
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const size = 10;
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          ctx.beginPath();
          if (Math.random() < 0.5) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size);
          } else {
            ctx.moveTo(x + size, y);
            ctx.lineTo(x, y + size);
          }
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }, []);
  

  function addNewArticles() {
    log("Checking for new articles.");
    return new Promise((resolve) => {
      const userDoc = doc(db, "users", currentUser.uid);

      getDoc(userDoc).then((userRes) => {
        let user;

        if (userRes.exists() && "lastAdded" in userRes.data()) {
          user = userRes.data();
        } else {
          // If user doesn't exist, it will be created later
          user = { lastAdded: "0000.00000" };
          log("Registering new user.");
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
              `Found ${articles.length} new articles! Adding them to your inbox.`
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


  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (!showScrollToTop && window.scrollY > 1000) {
        setShowScrollToTop(true);
      } else if (showScrollToTop && window.scrollY <= 1000) {
        setShowScrollToTop(false);
      }
    });
  });

  return (
    <div className={`dashboard ${currentFolder}`}>
        <canvas
          ref={canvasRef}
          className="swiper-canvas-bg"
        />
      <NavBar
        folder={currentFolder}
        setFolder={setCurrentFolder}
      />
      <ArticleSwiper className="article-swiper"
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
      {showScrollToTop && <button className="scroll-to-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>}

    </div>
  );
}
