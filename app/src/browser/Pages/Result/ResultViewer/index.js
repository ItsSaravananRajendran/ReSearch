import React from "react";

import { getCharacter } from "./util";
import Style from "./Style.css";

const MAX_LIMIT = 50;

const Title = (props) => {
  const { title, link } = props;
  return (
    <a href={link} className={Style.resultTitle}>
      {title}
    </a>
  );
};

const Para = (props) => {
  const { abstract_bert, answer } = props;
  const splitted = abstract_bert.split(answer);
  const requiredLength = Math.floor((MAX_LIMIT - answer.length) / 2);
  const preAnswer =
    splitted[0] && getCharacter(splitted[0], requiredLength, true);
  const postAnswer =
    splitted[1] && getCharacter(splitted[1], requiredLength, false);
  return (
    <div className={Style.para}>
      <span>{preAnswer}</span>
      <span className={Style.answer}>{answer}</span>
      <span>{postAnswer}</span>
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

const ResultViewer = ({ searchResult = {} }) => {
  const arrayOfResult = [];
  for (const key in searchResult) {
    key !== "keywords" && arrayOfResult.push(searchResult[key]);
  }
  return (
    <div className={Style.container}>
      {arrayOfResult.map((result) => (
        <ResultContainer key={result.idx} {...result} />
      ))}
    </div>
  );
};

export default ResultViewer;
