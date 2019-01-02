// This package provides two basic functions for plugin framework:
// build() and hook()

const mixin = require('../mixin');

module.exports = {
  build: function(target, config) {
    let n, max, plugin, plugins = config.plugins;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    }
  },

  hook: function(sm, name, additional) {
    let n, max, method, plugin,
        plugins = sm.config.plugins,
        args    = [sm.context];
    if (additional)
      args = args.concat(additional)
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n]
      method = plugins[n][name]
      if (method)
        method.apply(plugin, args);
    }
  }
}
