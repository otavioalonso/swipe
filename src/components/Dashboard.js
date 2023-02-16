import React, { useState } from "react";
// import {
//   Card,
//   Button,
//   Alert,
//   Navbar,
//   Nav,
//   NavItem,
//   Container,
// } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

import ArticleSwiper from "./ArticleSwiper";

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

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  const articleRef = collection(db, "articles");

  function fetchArticles(start, max_results) {
    return new Promise((resolve) => {
      console.log("Fetching papers from arXiv.");
      const arxivQuery = `https://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&start=${start}&max_results=${max_results}`;
      console.log(arxivQuery);

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
          console.log(`Fetched ${articles.length} articles.`);
          resolve(articles);
        });
      });
    });
  }

  function uploadArticles(articles) {
    return new Promise((resolve) => {
      console.log(`Uploading papers to database.`);
      let batch = writeBatch(db);
      articles.map((article) => {
        batch.set(doc(articleRef, article.arxiv.replace(".", "-")), article);
      });
      batch.commit();
      console.log(`Done.`);
      resolve();
    });
  }

  function handleImport() {
    fetchArticles(0, 100).then(uploadArticles);
  }

  return (
    <>
      <nav className="navbar navbar-expand-md flex-column">
        <div className="flex-row">
          <h6 className="navbar-text container" style={{ textAlign: "center" }}>
            <strong>User:</strong> {currentUser.email}
          </h6>
        </div>
        <div className="flex-column">
          <button className="btn btn-primary mx-2 my-2" onClick={handleImport}>
            Sync with arXiv
          </button>
          <a
            href="/update-profile"
            className="btn btn-outline-primary mx-2 my-2"
          >
            Update Profile
          </a>
          <button
            className="btn btn-outline-danger mx-2 my-2"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </nav>
      <ArticleSwiper />
    </>
  );
}
