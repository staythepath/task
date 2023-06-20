const WorkerPlugin = require("worker-plugin");

module.exports = function override(config, env) {
  // Add the worker-plugin to the plugins array
  config.plugins = (config.plugins || []).concat([new WorkerPlugin()]);

  return config;
};

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = function override(config, env) {
  config.plugins.push(new NodePolyfillPlugin());
  //...
  return config;
};
