import React from "react";
import { Link } from "react-router-dom";
import Style from "./Style.css";

import Header from "./Header";
import ResultViewer from "./ResultViewer";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchkey: "",
      searchResult: {},
    };
    ["getResult"].forEach((method) => (this[method] = this[method].bind(this)));
  }

  getResult() {}

  render() {
    const {
      state: { searchResult },
      getResult,
    } = this;
    return (
      <div className={Style.container}>
        <Header onDone={getResult} />
        <ResultViewer searchResult={searchResult} />
      </div>
    );
  }
}

export default Home;
