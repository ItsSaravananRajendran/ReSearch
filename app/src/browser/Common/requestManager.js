import { RequestHandler } from "../../Common/requestHandler";

const root = "http://dev.me:3000";

const requestHandlerFactory = (url, method = "get", header = {}) => (
  data,
  successCB,
  errorCB
) => RequestHandler(url, method, data, header, successCB, errorCB);

export default {
  getSearchResult: requestHandlerFactory(`${root}/getData`),
};
