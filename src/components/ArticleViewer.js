import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

export default function ArticleViewer(props) {
  const [numPages, setNumPages] = useState(null);
  const { arxiv } = useParams();

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  });

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <>
      <Document
        file={`https://arxiv.org/pdf/${arxiv}.pdf`}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(numPages), (e, i) => (
          <Page key={`page_${i + 1}`} pageNumber={i + 1} scale={96 / 72} />
        ))}
      </Document>
    </>
  );
}
