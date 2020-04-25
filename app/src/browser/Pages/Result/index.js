import React from "react";

import Style from "./Style.css";

import Loader from "../../Common/Loader";
import Header from "./Header";
import ResultViewer from "./ResultViewer";

class ResultPage extends React.Component {
  constructor(props) {
    super(props);
    [].forEach((method) => (this[method] = this[method].bind(this)));
  }

  render() {
    const {
      props: { searchResult, isLoading },
    } = this;
    return (
      <div>
        <Header {...this.props} />
        {isLoading ? <Loader /> : <ResultViewer searchResult={searchResult} />}
      </div>
    );
  }
}

export default ResultPage;
