import React from "react";

import { Switch, BrowserRouter as Router, Route } from "react-router-dom";

import ResultPage from "../../Pages/Result";
import HomePage from "../../Pages/Home";

class DataStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      searchResult: {},
      keyWords: [],
      searchQuery: "",
    };
    ["updateData"].forEach(
      (method) => (this[method] = this[method].bind(this))
    );
  }

  updateData(data) {
    this.setState({ ...data });
  }

  render() {
    const { updateData, state } = this;
    return (
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <HomePage {...props} setData={updateData} {...state} />
          )}
        />
        <Route
          exact
          path="/result"
          render={(props) => (
            <ResultPage {...props} setData={updateData} {...state} />
          )}
        />
      </Switch>
    );
  }
}

export default DataStore;
