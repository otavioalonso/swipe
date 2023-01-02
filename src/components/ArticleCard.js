import React from "react";
import "./ArticleCard.css";

export default function ArticleCard({
  title,
  avatar,
  abstract,
  authors,
  arxiv,
}) {
  return (
    <div className="card bg-white border-white border-0">
      <div className="card-img"></div>
      <div className="card-avatar">
        <img className="img-fluid" src={avatar} alt="Avatar" />
      </div>
      <div className="card-body">
        <h4 className="card-title">{title}</h4>
        <h6 className="card-text">{authors}</h6>
        <p className="card-text">{abstract}</p>
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
          Open on arXiv
        </a>
      </div>
    </div>
  );
}
