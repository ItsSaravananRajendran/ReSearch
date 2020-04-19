import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import DataStore from "./Common/DataStore";

const App = () => {
  return (
    <Router>
      <DataStore />
    </Router>
  );
};

export default App;
