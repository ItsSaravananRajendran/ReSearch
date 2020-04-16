import React from "react";

import Style from "./Style.css";

const Title = (props) => {
  const { title, link } = props;
  return (
    <a href={link} className={Style.resultTitle}>
      {title}
    </a>
  );
};

const Para = (props) => {
  const { full_answer, answer } = props;
  const splitted = full_answer.split(answer);
  return (
    <div>
      <span>{splitted[0] && splitted[0]}</span>
      <span className={Style.answer}>{answer}</span>
      <span>{splitted[1] && splitted[1]}</span>
    </div>
  );
};

const ResultContainer = (props) => {
  const { title, doi } = props;
  return (
    <div className={Style.resultContainer}>
      <Title title={title} link={doi} />
      <Para {...props} />
    </div>
  );
};

const ResultViewer = ({ searchResult = [] }) => {
  return (
    <div className={Style.container}>
      {searchResult.map((result) => (
        <ResultContainer key={result.idx} {...result} />
      ))}
    </div>
  );
};

export default ResultViewer;
