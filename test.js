const StateMachine =require( './src/state-machine');

var t={
  is:function(a,b){
  }
}
var fsm = new StateMachine();

t.is(fsm.state, 'none')
