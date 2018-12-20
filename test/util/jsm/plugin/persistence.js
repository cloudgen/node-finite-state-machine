import test                    from 'ava';
import StateMachine            from '../../../../src/state-machine';
import fs                      from 'fs';


test('persistence', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })
  fsm.save('data/temp.js');         t.is(fsm.filename, 'data/temp.js')
  fsm.reset();                      t.is(fsm.state, 'solid');
  fsm.save();                       t.is(fsm.state, 'solid');
  fsm.save('data/temp2.js');        t.is(fsm.filename, 'data/temp2.js');
  fsm.melt();                       t.is(fsm.state, 'liquid');
  fsm.vaporize();                   t.is(fsm.state, 'gas');
  fsm.condense();                   t.is(fsm.state, 'liquid');
  fsm.save('data/temp3.js');        t.is(fsm.state, 'liquid');
  fsm.freeze();                     t.is(fsm.state, 'solid');
  fsm.melt();                       t.is(fsm.state, 'liquid');
  fsm.vaporize();                   t.is(fsm.state, 'gas');
  fsm.save('data/temp4.js');        t.is(fsm.filename, 'data/temp4.js');
  fsm.condense();                   t.is(fsm.state, 'liquid');
  fsm.load('data/temp.js');         t.is(fsm.state, 'solid');
});

test('history with persistence, by default, just keeps growing', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  t.is(fsm.state, 'solid')
  t.deepEqual(fsm.history, [ 'solid' ])
  fsm.save('data/history.js');
  fsm.melt();     t.deepEqual(fsm.history, [ 'solid', 'liquid' ])
  fsm.vaporize(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])
  fsm.condense(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid' ])
  fsm.freeze();   t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  fsm.melt();     t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid' ])
  fsm.vaporize(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid', 'gas' ])

});

test('history from persistence', t => {

  var fsm2 = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  t.is(fsm2.state, 'solid')
  t.deepEqual(fsm2.history, [ 'solid' ])
  fsm2.load('data/history.js');  t.deepEqual(fsm2.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid', 'gas' ])

});
