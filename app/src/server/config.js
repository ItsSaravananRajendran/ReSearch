const common = {
  port: 3000,
  dist: "../../dist",
  queryServerUrl: "http://159.65.146.230:5000/",
};

const development = {
  ...common,
};

const production = {
  ...common,
};

exports.development = development;
exports.production = production;
