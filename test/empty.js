import test         from 'ava'
import StateMachine from '../src/state-machine'



test('empty state machine', t => {

  var fsm = new StateMachine();

  t.is(fsm.state, 'none')

  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})




test('empty state machine - applied to existing object', t => {

  var fsm = {};

  StateMachine.apply(fsm)

  t.is(fsm.state, 'none')

  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})



test('empty state machine factory', t => {

  var FSM = StateMachine.factory(),
      fsm = new FSM();

  t.is(fsm.state, 'none')
  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})



test('empty state machine factory - applied to existing class', t => {

  var FSM = function() { this._sm() };

  StateMachine.factory(FSM)

  var fsm = new FSM()

  t.is(fsm.state, 'none')
  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})


