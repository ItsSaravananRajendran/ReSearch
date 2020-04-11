import React from "react";
import ReactDelayRender from "react-delay-render";

import Style from "./Style.css";

const Loading = () => <div className={Style.loader}>Loading</div>;

export default ReactDelayRender({ delay: 300 })(Loading);
