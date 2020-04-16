import { RequestHandler } from "../../Common/requestHandler";

const root = "http://159.65.146.230:3000";

const requestHandlerFactory = (url, method = "get", header = {}) => (
  data,
  successCB,
  errorCB
) => RequestHandler(url, method, data, header, successCB, errorCB);

export default {
  getSearchResult: requestHandlerFactory(`${root}/query`),
};
