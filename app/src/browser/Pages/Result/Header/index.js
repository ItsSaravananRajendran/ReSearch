import React from "react";

import InputBox, { Title } from "../../../Common/InputBox";
import Style from "./Style.css";

const Header = (props) => {
  return (
    <div className={Style.headerContainer}>
      <div className={Style.centerContainer}>
        <Title className={Style.center} />
        <InputBox containerClass={Style.inputBox} {...props} />
      </div>
    </div>
  );
};

export default Header;
