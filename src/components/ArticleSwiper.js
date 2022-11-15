import React, { useState, useEffect } from "react";
import { set, get, ref, onValue, remove, update } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase.js";

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";

import "react-swipeable-list/dist/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ArticleSwiper.css";

import ArticleCard from "./ArticleCard";

export default function ArticleSwiper() {
  const [papers, setPapers] = useState([]);

  const { currentUser } = useAuth();

  useEffect(() => {
    onValue(
      ref(db, `/feed/${currentUser.uid}/inbox`),
      (snapshot) => {
        const data = snapshot.val();
        console.log("refresh", data);
        if (data !== null) {
          setPapers(Object.values(data));
        }
      },
      { onlyOnce: true }
    );
  }, []);

  function deletePaper(arxiv_number) {
    const aid = arxiv_number.replace(".", "-");
    console.log("removing", aid);
    remove(ref(db, `/feed/${currentUser.uid}/inbox/${aid}`));
  }

  function moveRef(oldRef, newRef) {
    get(oldRef).then((snap) => {
      if (snap.exists()) {
        set(newRef, snap.val());
        remove(oldRef);
      }
    });
  }

  function archivePaper(arxiv_number) {
    const aid = arxiv_number.replace(".", "-");
    console.log("saving", arxiv_number);
    moveRef(
      ref(db, `/feed/${currentUser.uid}/inbox/${aid}`),
      ref(db, `/feed/${currentUser.uid}/archive/${aid}`)
    );
  }

  function leadingActions(e) {
    return (
      <LeadingActions>
        <SwipeAction destructive={true} onClick={() => archivePaper(e.arxiv)}>
          <span></span>
        </SwipeAction>
      </LeadingActions>
    );
  }

  function trailingActions(e) {
    return (
      <TrailingActions>
        <SwipeAction destructive={true} onClick={() => deletePaper(e.arxiv)}>
          <span></span>
        </SwipeAction>
      </TrailingActions>
    );
  }

  return (
    <SwipeableList fullSwipe threshold={0.2}>
      {papers.map((paper) => (
        <SwipeableListItem
          key={paper.arxiv}
          leadingActions={leadingActions(paper)}
          trailingActions={trailingActions(paper)}
        >
          <ArticleCard
            title={paper.title}
            abstract={paper.abstract}
            avatar={paper.avatar}
            authors={paper.authors}
          />
        </SwipeableListItem>
      ))}
    </SwipeableList>
  );
}
