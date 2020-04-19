import React from "react";

import InputBox, { Title } from "../../../Common/InputBox";

import RequestManager from "../../../Common/requestManager";

import Style from "./Style.css";

const KeyWord = (props) => {
  const { keyword, onRemove } = props;
  return (
    <div className={Style.keyword}>
      {keyword}
      <a className={Style.close} data-value={keyword} onClick={onRemove}>
        &times;
      </a>
    </div>
  );
};

class AddKeyWord extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showButton: true, keyword: "" };
    [
      "toggleButton",
      "onChange",
      "onKeyPress",
      "submit",
      "getResultFailure",
      "getResultSuccess",
    ].forEach((method) => (this[method] = this[method].bind(this)));
  }

  onChange(e) {
    const keyword = e.currentTarget.value;
    this.setState({ keyword });
  }

  toggleButton() {
    this.setState({ showButton: false });
  }

  onKeyPress(e) {
    if (e.key === "Enter") this.submit();
  }

  getResultFailure(error) {
    this.props.setData({ isLoading: false });
  }

  getResultSuccess(result) {
    this.props.setData({
      isLoading: false,
      searchResult: result,
      keywords: result["keywords"],
    });
  }

  submit() {
    const newKeywords = this.state.keyword.split(",");
    const { searchQuery, keywords } = this.props;
    const merged = [...keywords, ...newKeywords];
    this.props.setData({ keywords: merged, isLoading: true });
    this.setState({ showButton: true, keyword: "" });
    RequestManager.getSearchResultWithKeyword(
      { value: searchQuery, keywords: merged },
      this.getResultSuccess,
      this.getResultFailure
    );
  }

  render() {
    const {
      state: { showButton, keyword },
      toggleButton,
      onKeyPress,
      onChange,
    } = this;
    return (
      <div onClick={toggleButton} className={Style.addButtonContainer}>
        {showButton ? (
          <div> Add keywords </div>
        ) : (
          <input
            ref={this.inputRef}
            className={Style.addKeyWord}
            value={keyword}
            onChange={onChange}
            onKeyPress={onKeyPress}
            autoFocus
            placeholder="add comma separated keywords"
          />
        )}
      </div>
    );
  }
}

class KeyWordInputBox extends React.Component {
  constructor(props) {
    super(props);
    ["getResultFailure", "getResultSuccess", "submit", "onRemove"].forEach(
      (method) => (this[method] = this[method].bind(this))
    );
  }

  getResultFailure(error) {
    this.props.setData({ isLoading: false });
  }

  getResultSuccess(result) {
    this.props.setData({
      isLoading: false,
      searchResult: result,
      keywords: result["keywords"],
    });
  }

  submit() {
    const {
      props: { searchQuery, onSubmit, keywords },
    } = this;
    if (searchQuery !== "") {
      this.props.setData({ isLoading: true });
      RequestManager.getSearchResultWithoutKeyword(
        { value: searchQuery, keywords },
        this.getResultSuccess,
        this.getResultFailure
      );
    }
  }

  onRemove(e) {
    const value = e.currentTarget.getAttribute("data-value");
    const { keywords = [], setData } = this.props;
    setData({ keywords: keywords.filter((keyword) => keyword !== value) });
    e.preventDefault();
  }

  render() {
    const {
      props: { keywords = [] },
      onRemove,
    } = this;
    return (
      <div className={Style.keywordContainer}>
        <span>
          {keywords.map((keyword) => (
            <KeyWord key={keyword} keyword={keyword} onRemove={onRemove} />
          ))}
        </span>
        <AddKeyWord {...this.props} />
      </div>
    );
  }
}

const Header = (props) => {
  return (
    <div className={Style.headerContainer}>
      <div className={Style.centerContainer}>
        <Title className={Style.center} />
        <div className={Style.inputClass}>
          <InputBox
            containerClass={Style.inputBox}
            {...props}
            withKeywords={true}
          />
          <KeyWordInputBox {...props} />
        </div>
      </div>
    </div>
  );
};

export default Header;
