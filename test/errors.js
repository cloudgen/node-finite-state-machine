import test         from 'ava'
import StateMachine from '../src/NodeFSM'

test('State cannot be set if not exists', t => {
  var fsm = new StateMachine({
        transitions: [
          { name: 'step1', from: 'none', to: 'A' },
          { name: 'step2', from: 'A',    to: 'B' }
        ]
  });
  var error = t.throws(() => {
    fsm.state = 'other'
  })
  t.is(error.message, 'Cannot set to undefined state')

});

test('StateMachine.apply only allowed on objects', t => {

  var config = {
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ]
  };

  var error = t.throws(() => {
    StateMachine.apply(function() {}, config)
  })
  t.is(error.message, 'StateMachine can only be applied to objects')

  error = t.throws(() => {
    StateMachine.apply([], config)
  })
  t.is(error.message, 'StateMachine can only be applied to objects')

  error = t.throws(() => {
    StateMachine.apply(42, config)
  })
  t.is(error.message, 'StateMachine can only be applied to objects')

});

test('invalid transition raises an exception', t => {

  var fsm = new StateMachine({
        transitions: [
          { name: 'step1', from: 'none', to: 'A' },
          { name: 'step2', from: 'A',    to: 'B' }
        ]
      });

  t.is(fsm.state,        'none')
  t.is(fsm.can('step1'),  true)
  t.is(fsm.can('step2'), false)

  try {
    fsm.step2();
    // Error has been occur, the following line cannot be run!
    t.is(true,    true);
  }catch(error){
    t.is(error.message,    'transition is invalid in current state')
    t.is(error.transition, 'step2')
    t.is(error.from,       'none')
    t.is(error.to,         undefined)
    t.is(error.current,    'none')
  }
});


test('invalid transition handler can be customized', t => {

  var fsm = new StateMachine({
        transitions: [
          { name: 'step1', from: 'none', to: 'A' },
          { name: 'step2', from: 'A',    to: 'B' }
        ],
        methods: {
          onInvalidTransition: function() { return 'custom error'; }
        }
      });

  t.is(fsm.state,        'none')
  t.is(fsm.can('step1'),  true)
  t.is(fsm.can('step2'), false)
  t.is(fsm.step2(),      'custom error')
  t.is(fsm.state,        'none')

})

test('fire transition while existing transition is still in process raises an exception', t => {

  var fsm = new StateMachine({
        transitions: [
          { name: 'step', from:  'none', to: 'A' },
          { name: 'other', from: '*',    to: 'X' }
        ],
        methods: {
          onBeforeStep:  function() { this.other();                 },
          onBeforeOther: function() { t.fail('should never happen') },
          onEnterX:      function() { t.fail('should never happen') }
        }
      });

  t.is(fsm.state,        'none')
  t.is(fsm.can('step'),  true)
  t.is(fsm.can('other'), true)

  try{
    fsm.step();
    // Error has been occur, the following line cannot be run!
    t.is(true,    true);
  }catch(error){
    t.is(error.message, 'transition is invalid while previous transition is still in progress')
    t.is(error.transition, 'other')
    t.is(error.from,       'none')
    t.is(error.to,         'X')
    t.is(error.current,    'none')
    t.is(fsm.state, 'none', 'entire transition was cancelled by the exception')
  }
});



test('pending transition handler can be customized', t => {

  var error = "",
      fsm = new StateMachine({
        transitions: [
          { name: 'step', from:  'none', to: 'A' },
          { name: 'other', from: '*',    to: 'X' }
        ],
        methods: {
          onBeforeStep:        function() { error = this.other(); return false },
          onPendingTransition: function() { return 'custom error' },
          onBeforeOther:       function() { t.fail('should never happen') },
          onEnterX:            function() { t.fail('should never happen') }
        }
      });

  t.is(fsm.state,        'none')
  t.is(fsm.can('step'),  true)
  t.is(fsm.can('other'), true)
  t.is(fsm.step(),       false)
  t.is(fsm.state,        'none')
  t.is(error,            'custom error')

})
