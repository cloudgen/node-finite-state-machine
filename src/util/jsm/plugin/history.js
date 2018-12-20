const camelize = require('../../camelize');

module.exports = function(options) { options = options || {};
  var past       = camelize(options.name || options.past   || 'history'),
      pastTime   = camelize(past, 'time'),
      future     = camelize(options.future || 'future'),
      futureTime = camelize(future, 'time'),
      clear      = camelize('clear', past),
      back       = camelize(past,   'back'),
      forward    = camelize(past,   'forward'),
      canBack    = camelize('can',   back),
      canForward = camelize('can',   forward),
      max        = options.max;
  var plugin = {
    configure: function(config) {
      config.addTransitionLifecycleNames(back);
      config.addTransitionLifecycleNames(forward);
    },
    init: function(instance) {
      instance[past]       = [];
      instance[pastTime]   = [];
      instance[future]     = [];
      instance[futureTime] = [];
    },
    reset: function(instance){
      instance[past].length       = 1;
      instance[pastTime]          = [Math.floor(Date.now())];
      instance[future].length     = 0;
      instance[futureTime].length = 0;
    },
    setState: function(instance, state){
      instance[past]              = [state];
      instance[pastTime].length   = 1;
      instance[future].length     = 0;
      instance[futureTime].length = 0;
    },
    lifecycle: function(instance, lifecycle) {
      if (lifecycle.event === 'onEnterState') {
        instance[past].push(lifecycle.to);
        instance[pastTime].push(Math.floor(Date.now()));
        if (max && instance[past].length > max){
          instance[past].shift();
          instance[pastTime].shift();
        }
        if (lifecycle.transition !== back && lifecycle.transition !== forward){
          instance[future].length = 0;
          instance[futureTime].length = 0;
        }
      }
    },
    methods:    {},
    properties: {}
  }
  plugin.pluginName='history';
  plugin.methods[clear] = function() {
    this[past].length = 0
    this[future].length = 0
    this[pastTime].length = 0
    this[futureTime].length = 0
  }
  plugin.properties[canBack] = {
    get: function() {
      return this[past].length > 1
    }
  }
  plugin.properties[canForward] = {
    get: function() {
      return this[future].length > 0
    }
  }
  plugin.methods[back] = function() {
    if (!this[canBack])
      throw Error('no history');
    var from     = this[past].pop(),
        fromTime = this[pastTime].pop(),
        to       = this[past].pop();
    this[future].push(from);
    this[futureTime].push(fromTime);
    this.transit(back, from, to, []);
  }
  plugin.methods[forward] = function() {
    if (!this[canForward])
      throw Error('no history');
    var from = this.state,
        fromTime = this[futureTime].pop();
        to = this[future].pop();
    this[pastTime].push(fromTime);
    this.transit(forward, from, to, []);
  }
  return plugin;
}
