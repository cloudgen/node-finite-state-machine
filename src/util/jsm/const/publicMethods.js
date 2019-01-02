// These public methods are exposed to the final object
module.exports = {
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
