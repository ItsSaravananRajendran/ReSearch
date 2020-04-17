import React from "react";

import { getCharacter } from "./util";
import Style from "./Style.css";

const MAX_LIMIT = 100;

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
  console.log(requiredLength);
  const preAnswer =
    splitted[0] && getCharacter(splitted[0], requiredLength, true);
  const postAnswer =
    splitted[1] && getCharacter(splitted[1], requiredLength, false);
  return (
    <div>
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
