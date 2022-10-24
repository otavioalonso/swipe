import React, { Component } from "react";

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";

import "react-swipeable-list/dist/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import ArticleCard from "./components/ArticleCard";

class App extends Component {
  state = { papers: [] };

  componentDidMount() {
    fetch("https://react-papers-default-rtdb.firebaseio.com/papers.json")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({ papers: data });
      });
  }

  leadingActions = (e) => (
    <LeadingActions>
      <SwipeAction destructive={true} onClick={() => console.info("saved", e)}>
        <span></span>
      </SwipeAction>
    </LeadingActions>
  );

  trailingActions = (e) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => console.info("discarded", e)}
      >
        <span></span>
      </SwipeAction>
    </TrailingActions>
  );

  render() {
    return (
      <SwipeableList fullSwipe threshold={0.2}>
        {this.state.papers.map((paper) => (
          <SwipeableListItem
            key={paper.arxiv}
            leadingActions={this.leadingActions(paper)}
            trailingActions={this.trailingActions(paper)}
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
}

export default App;
