import React from "react";
import "./ArticleCard.css";

import { decode } from "html-entities";

import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

function textToKatex(text) {
  const textSplit = decode(text).split("$");

  if (textSplit.length % 2 == 1) {
    return (
      <>
        {textSplit.map((t, i) =>
          i % 2 ? <InlineMath key={i}>{t}</InlineMath> : t
        )}
      </>
    );
  } else {
    return text;
  }
}

export default function ArticleCard({
  title,
  avatar,
  abstract,
  authors,
  arxiv,
  published,
}) {
  return (
    <div className="card bg-white border-white border-0">
      <div className="card-img"></div>
      <div className="card-avatar">
        <img className="img-fluid" src={avatar} alt="Avatar" />
      </div>
      <div className="card-body">
        <div className="card-header">
          <h4 className="card-title">{textToKatex(title)}</h4>
          <h6 className="card-text">{authors}</h6>
          <p className="card-text">{published}</p>
        </div>
        <p className="card-text">{textToKatex(abstract)}</p>
      </div>
      <div className="card-footer">
        <a
          href={`https://arxiv.org/pdf/${arxiv}`}
          className="btn btn-primary mx-2"
          target="_blank"
        >
          View PDF
        </a>
        <a
          href={`https://arxiv.org/abs/${arxiv}`}
          className="btn btn-outline-primary mx-2"
          target="_blank"
        >
          arXiv:{arxiv}
        </a>
      </div>
    </div>
  );
}
