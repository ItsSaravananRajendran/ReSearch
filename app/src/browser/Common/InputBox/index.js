import React from "react";
import Style from "./Style.css";

class InputBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      selected: false,
    };
    ["onChange", "submit", "onKeyPress", "onFocus", "onBlur"].forEach(
      (method) => (this[method] = this[method].bind(this))
    );
  }

  onKeyPress(e) {
    if (e.key === "Enter") this.submit();
  }

  onChange(e) {
    const value = e.currentTarget.value;
    this.setState({ value });
  }

  onFocus(e) {
    this.setState({ selected: true });
  }

  onBlur(e) {
    this.setState({ selected: false });
  }

  submit() {
    const {
      props: { onDone: callBack },
      state: { value },
    } = this;
    callBack(value);
  }

  render() {
    const {
      state: { value, selected },
      props: { containerClass = "" },
      onChange,
      onKeyPress,
      onFocus,
      onBlur,
    } = this;
    const className = `${Style.container} ${containerClass} ${
      selected ? Style.selected : null
    } `;
    return (
      <div className={className}>
        <input
          className={Style.inputBox}
          type="text"
          value={value}
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
