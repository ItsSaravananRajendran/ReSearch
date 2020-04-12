import React from "react";

import Style from "./Style.css";

import Loader from "../../Common/Loader";
import Header from "./Header";
import ResultViewer from "./ResultViewer";

import RequestManager from "../../Common/requestManager";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchkey: "",
      searchResult: {},
      isLoading: false,
    };
    ["getResult", "getResultSuccess", "getResultFailure"].forEach(
      (method) => (this[method] = this[method].bind(this))
    );
  }

  getResultFailure(error) {
    this.setState({ isLoading: false });
  }

  getResultSuccess(result) {
    this.setState({ isLoading: false, searchResult: result });
  }

  getResult(value) {
    this.setState({ isLoading: true });
    RequestManager.getSearchResult(
      { value },
      this.getResultSuccess,
      this.getResultFailure
    );
  }

  render() {
    const {
      state: { searchResult, isLoading },
      getResult,
    } = this;
    return (
      <div className={Style.container}>
        {isLoading && <Loader />}
        <Header onDone={getResult} />
        <ResultViewer searchResult={searchResult} />
      </div>
    );
  }
}

export default Home;
