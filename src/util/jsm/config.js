// This is the configuration object which provides all the functionalities
// of an object create or modified by the "Node Finite State Machine"

const mixin    = require('../mixin');
const camelize = require('../camelize');

class Config{

  constructor(options, StateMachine) {
    options = options || {};
    this.options     = options;
    this.defaults    = StateMachine.defaults;
    this.states      = [];
    this.transitions = [];
    this.map         = {};
    this.lifecycle   = this.configureLifecycle();
    this.init        = this.configureInitTransition(options.init);
    this.data        = this.configureData(options.data);
    this.ENUM        = options.ENUM;
    this.methods     = this.configureMethods(options.methods);
    this.map[this.defaults.wildcard] = {};
    this.configureTransitions(options.transitions || []);
    this.plugins = this.configurePlugins(options.plugins, StateMachine.plugins);
    var enumSize = 0;
    for(var n in options.ENUM){
      enumSize ++;
    }
    if(enumSize==0){
      this.ENUM = {};
      for(var i in this.states){
        this.ENUM[this.states[i]] = i;
      }
    }
    if(this.ENUM['none']==undefined){
      this.ENUM['none'] = 0;
    }
  }

  addState(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  }

  addStateLifecycleNames(name) {
    this.lifecycle.onEnter[name] = camelize('onEnter', name);
    this.lifecycle.onLeave[name] = camelize('onLeave', name);
    this.lifecycle.on[name]      = camelize('on',      name);
  }

  addTransition(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  }

  addTransitionLifecycleNames(name) {
    this.lifecycle.onBefore[name] = camelize('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize('onAfter',  name);
    this.lifecycle.on[name]       = camelize('on',       name);
  }

  mapTransition(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  }

  configureLifecycle() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  }

  configureInitTransition(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  }

  configureData(data) {
    if (typeof data === 'function'){
      return data;
    } else if (typeof data === 'object') {
      return function() { return data; }
    } else {
      // return an function wrap for an empty object
      return function() {
        return {};
      }
    }
  }

  configureMethods(methods) {
    return methods || {};
  }

  configurePlugins(plugins, builtins) {
    plugins = plugins || [];
    var n, plugin, pluginMap = {};
    for(n = 0; n < plugins.length ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function'){
        plugins[n] = plugin = plugin();
      }
      if(typeof plugin.pluginName!='undefined'){
        pluginMap[plugin.pluginName] = true;
      }
      if (plugin.configure){
        plugin.configure(this);
      }
    }
    for(var m = 0; m < builtins.length ; m++) {
      plugin = builtins[m];
      /* istanbul ignore next */
      if (typeof plugin === 'function'){
        plugin = plugin();
      }
      if(typeof plugin.pluginName=='undefined' ||
        typeof pluginMap[plugin.pluginName] == 'undefined'
      ){
        pluginMap[plugin.pluginName] = true;
        plugins.push( plugin );
        if (plugin.configure){
          plugin.configure(this);
        }
      }
    }
    return plugins;
  }

  configureTransitions(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  }

  transitionFor(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  }

  transitionsFor(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  }

  allStates() {
    return this.states;
  }

  allTransitions() {
    return this.transitions;
  }
}
module.exports = Config;
