import React from "react";

import InputBox, { Title } from "../../Common/InputBox";

import Style from "./Style.css";

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    ["goToResult"].forEach(
      (method) => (this[method] = this[method].bind(this))
    );
  }

  goToResult() {
    const { history } = this.props;
    history.push("/result");
  }

  render() {
    return (
      <div className={Style.container}>
        <div className={Style.titleComponent}>
          <Title className={Style.research} />
          <InputBox
            containerClass={Style.inputBoxContainer}
            {...this.props}
            onSubmit={this.goToResult}
          />
        </div>
      </div>
    );
  }
}

export default HomePage;
