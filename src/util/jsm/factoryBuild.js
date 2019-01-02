const pluginSystem     = require('./pluginSystem');
const SM               = require('./sm');
const PublicProperties = require('./const/publicProperties');
const PublicMethods    = require('./const/publicMethods');
const camelize         = require('../camelize');
const mixin            = require('../mixin');

// This function copy the Configuration/options to the existing object
// Please refers to util/jsm/config.js for details
module.exports = function (target, config, factory) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  pluginSystem.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);

  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._sm.fire(transition, [].slice.call(arguments))
    }
  });
  target._sm = function() {
    this._sm = new SM(this, config);
    this._sm.init(arguments);
    this._sm.nonce = factory.NONCE();
    this.ENUM=this._sm.ENUM;
  }
}
