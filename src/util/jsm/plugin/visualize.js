const mixin = require('../../mixin')

function visualize(sm, options) {
  return dotify(dotcfg(sm, options));
}

function dotcfg(sm, options) {
  options = options || {}

  let config      = dotcfg.fetch(sm),
      name        = options.name,
      rankdir     = dotcfg.rankdir(options.orientation),
      states      = dotcfg.states(config, options),
      transitions = dotcfg.transitions(config, options),
      result      = { }

  if (name)
    result.name = name

  if (rankdir)
    result.rankdir = rankdir

  if (states && states.length > 0)
    result.states = states

  if (transitions && transitions.length > 0)
    result.transitions = transitions

  return result
}

dotcfg.fetch = function(sm) {
  return (typeof sm === 'function') ? sm.prototype.getConfig()
                                     : sm.getConfig()
}
dotcfg.rankdir = function(orientation) {
  if (orientation === 'horizontal')
    return 'LR';
  else if (orientation === 'vertical')
    return 'TB';
}

dotcfg.states = function(config, options) {
  let index, states = config.states;
  if (!options.init) { // if not showing init transition, then slice out the implied init :from state
    index  = states.indexOf(config.init.from);
    states = states.slice(0, index).concat(states.slice(index+1));
  }
  return states;
}

dotcfg.transitions = function(config, options) {
  let n, max, transition,
      init        = config.init,
      transitions = config.options.transitions || [], // easier to visualize using the ORIGINAL transition declarations rather than our run-time mapping
      output = [];
  if (options.init && init.active)
    dotcfg.transition(init.name, init.from, init.to, init.dot, config, options, output)
  for (n = 0, max = transitions.length ; n < max ; n++) {
    transition = config.options.transitions[n]
    dotcfg.transition(transition.name, transition.from, transition.to, transition.dot, config, options, output)
  }
  return output
}

dotcfg.transition = function(name, from, to, dot, config, options, output) {
  let n, max, wildcard = config.defaults.wildcard

  if (Array.isArray(from)) {
    for(n = 0, max = from.length ; n < max ; n++)
      dotcfg.transition(name, from[n], to, dot, config, options, output)
  }
  else if (from === wildcard || from === undefined) {
    for(n = 0, max = config.states.length ; n < max ; n++)
      dotcfg.transition(name, config.states[n], to, dot, config, options, output)
  }
  else if (to === wildcard || to === undefined) {
    dotcfg.transition(name, from, from, dot, config, options, output)
  }
  else if (typeof to === 'function') {
    // do nothing, can't display conditional transition
  }
  else {
    output.push(mixin({}, { from: from, to: to, label: pad(name) }, dot || {}))
  }

}

function pad(name) {
  return " " + name + " "
}

function quote(name) {
  return "\"" + name + "\""
}

function dotify(dotcfg) {

  dotcfg = dotcfg || {};

  let name        = dotcfg.name || 'sm',
      states      = dotcfg.states || [],
      transitions = dotcfg.transitions || [],
      rankdir     = dotcfg.rankdir,
      output      = [],
      n, max;

  output.push("digraph " + quote(name) + " {")
  if (rankdir)
    output.push("  rankdir=" + rankdir + ";")
  for(n = 0, max = states.length ; n < max ; n++)
    output.push(dotify.state(states[n]))
  for(n = 0, max = transitions.length ; n < max ; n++)
    output.push(dotify.edge(transitions[n]))
  output.push("}")
  return output.join("\n")

}

dotify.state = function(state) {
  return "  " + quote(state) + ";"
}

dotify.edge = function(edge) {
  return "  " + quote(edge.from) + " -> " + quote(edge.to) + dotify.edge.attr(edge) + ";"
}

dotify.edge.attr = function(edge) {
  let n, max, key, keys = Object.keys(edge).sort(), output = [];
  for(n = 0, max = keys.length ; n < max ; n++) {
    key = keys[n];
    if (key !== 'from' && key !== 'to')
      output.push(key + "=" + quote(edge[key]))
  }
  return output.length > 0 ? " [ " + output.join(" ; ") + " ]" : ""
}

visualize.dotcfg = dotcfg;
visualize.dotify = dotify;
visualize.pluginName = 'visualize';
module.exports = visualize;
