import { decode } from "html-entities";

import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import "./ArticleSwiper.css";

function textToKatex(text) {
  const textSplit = decode(text).split("$");

  if (textSplit.length % 2 === 1) {
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
    <div className="article-card">
      <div className="card-img"></div>
      <div className="card-body">
        <div className="card-header">
          <h4 className="card-title">{textToKatex(title)}</h4>
          <h6 className="card-text">{authors}</h6>
          <p className="card-text">{published}</p>
        </div>
        <p className="card-text">{textToKatex(abstract)}</p>
      </div>
      <div className="card-footer">
        <button
          className="btn btn-primary"
          onClick={() => window.open(`https://arxiv.org/html/${arxiv}`, '_blank')}
        >
          View HTML
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => window.open(`https://arxiv.org/abs/${arxiv}`, '_blank')}
        >
          arXiv:{arxiv}
        </button>
      </div>
    </div>
  );
}
