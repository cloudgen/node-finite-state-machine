// This is the main entry point for "Node finite state machine"

const mixin       = require('./util/mixin');
const camelize    = require('./util/camelize');
const plugin      = require('./util/jsm/plugin');
const Config      = require('./util/jsm/config');
const SM          = require('./util/jsm/sm');
const history     = require('./util/jsm/plugin/history');
const persistence = require('./util/jsm/plugin/persistence');
const visualize   = require('./util/jsm/plugin/visualize');


// These public methods are exposed to the final object
var PublicMethods = {
  is:                  function(state)                     { return this._sm.is(state)                           },
  can:                 function(transition)                { return this._sm.can(transition)                     },
  cannot:              function(transition)                { return this._sm.cannot(transition)                  },
  observe:             function()                          { return this._sm.observe(arguments)                  },
  reset:               function()                          { return this._sm.reset()                             },
  getConfig:           function()                          { return this._sm.config                              },
  transit:             function(transition, from, to, args){ return this._sm.transit(transition, from, to, args) },
  transitions:         function()                          { return this._sm.transitions()                       },
  allStates:           function()                          { return this._sm.allStates()                         },
  allTransitions:      function()                          { return this._sm.allTransitions()                    },
  onInvalidTransition: function(t, from, to)               { return this._sm.onInvalidTransition(t, from, to)    },
  onPendingTransition: function(t, from, to)               { return this._sm.onPendingTransition(t, from, to)    },
}

var stateMachineCount = 0;

// These public properties are exposed to the final object
var PublicProperties = {
  // state are the key property for identifying the current state
  // in order to provide the persistence function,
  // we allow the state to be set outside the Finite State Machine
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._sm.state;
    },
    set: function(state) {
      this._sm.setState(state);
    }
  },
  // The purpose of using nonce, is we are trying to get an unique ID in run time.
  // It works with stateMachineCount
  nonce: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._sm.nonce;
    },
    set: function(nonce) {
      if(typeof nonce=='number' && parseInt(nonce) == nonce){
        StateMachine.NONCE(nonce);
        this._sm.nonce = nonce;
      } else {
        throw Error("NONCE should be number ")
      }
    }
  },
  // The createTime is used for audit purpose
  createTime: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._sm.createTime;
    },
    set: function(timestamp) {
      this._sm.createTime = timestamp;
    }
  },
  // The updateTime is used for audit purpose
  updateTime: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._sm.updateTime;
    },
    set: function(timestamp) {
      this._sm.updateTime = timestamp;
    }
  }
}

// This function add the node finite state machine to an oject
function applyConfig(instance, options) {
  var config = new Config(options, StateMachine);
  build(instance, config);
  instance._sm();
  return instance;
}


// This function copy the Configuration/options to the existing object
// Please refers to util/jsm/config.js for details
function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
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
    this._sm.nonce = StateMachine.NONCE();
    this.ENUM=this._sm.ENUM;
  }
}

// This is the Main body of Node Finite State Machine
function StateMachine(options) {
  return applyConfig(this, options);
}

StateMachine.version  = '3.0.1';
StateMachine.NONCE    = function(id){
  if(typeof id=='undefined'){
    return ++stateMachineCount;
  }
  if(typeof id=='number'){
    var newId = parseInt(id);
    if(newId > stateMachineCount){
      stateMachineCount = newId;
    }
  }
};

// This is the Enum of Plugin
StateMachine.PLUGIN = {
  HISTORY: history,
  PERSISTENCE: persistence,
  VISUALIZE: visualize
};

// This is the Factory of Node Finite State Machine
StateMachine.factory  = function() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._sm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._sm.config = config;
  return cstor;
};

StateMachine.apply  = applyConfig;
StateMachine.defaults = {
  wildcard: '*',
  init: {
    name: 'init',
    from: 'none'
  }
}

// The following plugin have been include as builtin plugins
StateMachine.plugins = [
  StateMachine.PLUGIN.HISTORY,
  StateMachine.PLUGIN.PERSISTENCE
];

module.exports = StateMachine;
