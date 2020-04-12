import React from "react";

import InputBox from "../../../Common/InputBox";
import Style from "./Style.css";

const Header = (props) => {
  return (
    <div className={Style.container}>
      <InputBox containerClass={Style.inputBox} {...props} />
    </div>
  );
};

export default Header;
