const superAgent = require("superagent");

const RequestHandler = (
  url,
  method = "get",
  data = {},
  headers = {},
  successCB,
  errorCB
) => {
  return superAgent[method](url)
    .send(data)
    .set(headers)
    .end((err, res) => {
      if (err) errorCB(err);
      else successCB(res.body);
    });
};

exports.RequestHandler = RequestHandler;
