const Config       = require('./config');
const FactoryBuild = require('./factoryBuild');

// This is the Factory of Node Finite State Machine
module.exports = function() {
  let cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._sm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  let config = new Config(options, this);
  FactoryBuild(cstor.prototype, config, this);
  cstor.prototype._sm.config = config;
  return cstor;
};
