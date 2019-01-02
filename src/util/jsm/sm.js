// This is the code provided for the main logic of a finite state machine
const mixin      = require('../mixin');
const Exception  = require('./exception');
const plugin     = require('./plugin');
const UNOBSERVED = [ null, [] ];

class SM{

  // This constructor tried to provide the basic
  // object instructure, especially the config
  constructor(context, config) {
    this.nonce      = 0;
    this.type       = '';
    this.context    = context;
    this.config     = config;
    this.state      = config.init.from;
    this.observers  = [context];
    this.ENUM       = {};
    this.createTime = Math.floor(Date.now());
    this.updateTime = Math.floor(Date.now());
    for(var i in config.ENUM){
      this.ENUM[i] = config.ENUM[i];
    }
  }

  // Init function trying to copy the config's data to the
  // current object's context
  init(args) {
    mixin(this.context, this.config.data.apply(this.context, args));
    plugin.hook(this, 'init');
    if (this.config.init.active){
      return this.fire(this.config.init.name, []);
    }
  }

  // The reset function all the object return to the initial state
  reset(){
    this.state=this.config.init.to;
    this.updateTime = this.createTime = Math.floor(Date.now());
    plugin.hook(this, 'reset');
    plugin.hook(this, 'change', this.config.init.to);
  }

  // This function allows object set to any existing state
  // It's useful for persistence
  setState(state){
    var state=this.config.states.find(function(s){return state==s});
    if(state){
      this.state      = state;
      this.updateTime = Math.floor(Date.now());
      plugin.hook(this, 'setState', state);
      plugin.hook(this, 'change', state);
    }else{
      throw new Exception("Cannot set to undefined state", 'n/a', 'n/a', state, this.state);
    }
  }

  is(state) {
    return Array.isArray(state) ? (state.indexOf(this.state) >= 0) : (this.state === state);
  }

  isPending() {
    return this.pending;
  }

  can(transition) {
    return !this.isPending() && !!this.seek(transition);
  }

  cannot(transition) {
    return !this.can(transition);
  }

  allStates() {
    return this.config.allStates();
  }

  allTransitions() {
    return this.config.allTransitions();
  }

  transitions() {
    return this.config.transitionsFor(this.state);
  }

  seek(transition, args) {
    var wildcard = this.config.defaults.wildcard,
        entry    = this.config.transitionFor(this.state, transition),
        to       = entry && entry.to;
    if (typeof to === 'function')
      return to.apply(this.context, args);
    else if (to === wildcard)
      return this.state
    else
      return to
  }

  fire(transition, args) {
    return this.transit(transition, this.state, this.seek(transition, args), args);
  }

  transit(transition, from, to, args) {
    var lifecycle = this.config.lifecycle,
        changed   = this.config.options.observeUnchangedState || (from !== to);
    if (!to)
      return this.context.onInvalidTransition(transition, from, to);
    if (this.isPending())
      return this.context.onPendingTransition(transition, from, to);
    this.config.addState(to);
    this.beginTransit();
    args.unshift({
      transition: transition,
      from:       from,
      to:         to,
      fsm:        this.context
    });
    return this.observeEvents([
                this.observersForEvent(lifecycle.onBefore.transition),
                this.observersForEvent(lifecycle.onBefore[transition]),
      changed ? this.observersForEvent(lifecycle.onLeave.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onLeave[from]) : UNOBSERVED,
                this.observersForEvent(lifecycle.on.transition),
      changed ? [ 'doTransit', [ this ] ]                       : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter[to])   : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.on[to])        : UNOBSERVED,
                this.observersForEvent(lifecycle.onAfter.transition),
                this.observersForEvent(lifecycle.onAfter[transition]),
                this.observersForEvent(lifecycle.on[transition])
    ], args);
  }

  beginTransit(){
    this.pending = true;
  }

  endTransit(result){
    this.pending = false;
    plugin.hook(this, 'change', this.state);
    this.updateTime = Math.floor(Date.now());
    return result;
  }

  failTransit(result){
    this.pending = false;
    throw result;
  }

  doTransit(lifecycle) {
    this.state = lifecycle.to;
  }

  observe(args) {
    if (args.length === 2) {
      var observer = {};
      observer[args[0]] = args[1];
      this.observers.push(observer);
    }
    else {
      this.observers.push(args[0]);
    }
  }

  observersForEvent(event) {
    var n = 0, max = this.observers.length, observer, result = [];
    for( ; n < max ; n++) {
      observer = this.observers[n];
      if (observer[event])
        result.push(observer);
    }
    return [ event, result, true ]
  }

  observeEvents(events, args, previousEvent, previousResult) {
    if (events.length === 0) {
      return this.endTransit(previousResult === undefined ? true : previousResult);
    }
    var event     = events[0][0],
        observers = events[0][1],
        pluggable = events[0][2];
    args[0].event = event;
    if (event && pluggable && event !== previousEvent)
      plugin.hook(this, 'lifecycle', args);

    if (observers.length === 0) {
      events.shift();
      return this.observeEvents(events, args, event, previousResult);
    }
    else {
      var observer = observers.shift(),
          result = observer[event].apply(observer, args);
      if (result && typeof result.then === 'function') {
        return result.then(this.observeEvents.bind(this, events, args, event))
                     .catch(this.failTransit.bind(this))
      }
      else if (result === false) {
        return this.endTransit(false);
      }
      else {
        return this.observeEvents(events, args, event, result);
      }
    }
  }

  onInvalidTransition(transition, from, to) {
    throw new Exception("transition is invalid in current state", transition, from, to, this.state);
  }

  onPendingTransition(transition, from, to) {
    throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
  }
}
module.exports = SM;
