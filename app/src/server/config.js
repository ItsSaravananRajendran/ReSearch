const common = {
  port: 3000,
  dist: "../../dist",
};

const development = {
  ...common,
};

const production = {
  ...common,
};

exports.development = development;
exports.production = production;
