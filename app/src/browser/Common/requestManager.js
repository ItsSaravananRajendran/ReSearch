import RequestHandler from "../../Common/requestHandler";

export default {
  getSearchResult: RequestHandler(url, "get", data, {}, successCB, errorCB),
};
