import React from "react";
import Style from "./Style.css";

import RequestManager from "../requestManager";

const Title = ({ className }) => {
  return <div className={className}>ReSearch</div>;
};

class InputBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
    };
    [
      "onChange",
      "submit",
      "onKeyPress",
      "onFocus",
      "onBlur",
      "getResultFailure",
      "getResultSuccess",
    ].forEach((method) => (this[method] = this[method].bind(this)));
  }

  onKeyPress(e) {
    if (e.key === "Enter") this.submit();
  }

  onChange(e) {
    const searchQuery = e.currentTarget.value;
    this.props.setData({ searchQuery });
  }

  onFocus(e) {
    this.setState({ selected: true });
  }

  onBlur(e) {
    this.setState({ selected: false });
  }

  getResultFailure(error) {
    this.props.setData({ isLoading: false });
  }

  getResultSuccess(result) {
    const searchResult = [];
    for (const key in result) {
      searchResult.push(result[key]);
    }
    this.props.setData({ isLoading: false, searchResult });
  }

  submit() {
    const {
      props: { searchQuery, onSubmit },
    } = this;
    if (searchQuery !== "") {
      this.props.setData({ isLoading: true });
      RequestManager.getSearchResult(
        { value: searchQuery },
        this.getResultSuccess,
        this.getResultFailure
      );
      onSubmit && onSubmit();
    }
  }

  render() {
    const {
      state: { selected },
      props: { searchQuery, containerClass = "" },
      onChange,
      onKeyPress,
      onFocus,
      onBlur,
      placeholder = "",
    } = this;
    const className = `${Style.container} ${containerClass} ${
      selected ? Style.selected : Style.notInFocus
    } `;
    return (
      <div className={className}>
        <input
          placeholder={placeholder}
          className={Style.inputBox}
          type="text"
          value={searchQuery}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    );
  }
}

export default InputBox;
export { Title };
