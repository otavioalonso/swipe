import React from "react";
import "./Card.css";

const card = ({ title, avatar, abstract, authors }) => (
  <div className="card card-custom bg-white border-white border-0">
    <div className="card-custom-img"></div>
    <div className="card-custom-avatar">
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
      <a href="#" className="btn btn-primary">
        Option
      </a>
      <a href="#" className="btn btn-outline-primary">
        Other option
      </a>
    </div>
  </div>
);

export default card;
