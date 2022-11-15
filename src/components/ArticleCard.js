import React from "react";
import "./ArticleCard.css";

export default function ArticleCard({ title, avatar, abstract, authors }) {
  return (
    <div className="card card-custom bg-white border-white border-0">
      <div className="card-custom-img"></div>
      <div className="card-avatar">
        <img className="img-fluid" src={avatar} alt="Avatar" />
      </div>
      <div className="card-body" style={{ overflowY: "auto" }}>
        <h4 className="card-title card-title-custom">{title}</h4>
        <h6 className="card-text">{authors}</h6>
        <p className="card-text card-text-custom">{abstract}</p>
      </div>
      <div
        className="card-footer"
        style={{ background: "inherit", borderColor: "inherit" }}
      >
        <a href="#" className="btn btn-primary mx-2">
          View PDF
        </a>
        <a href="#" className="btn btn-outline-primary mx-2">
          Open abstract
        </a>
      </div>
    </div>
  );
}
