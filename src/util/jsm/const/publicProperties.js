// These public properties are exposed to the final object
module.exports = {
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
      let supposeError = true;
      let allStates = this.allStates();
      for(let s in allStates){
        if(allStates[s] == state){
          this._sm.setState(state);
          supposeError = false;
        }
      }
      if(supposeError){
        throw Error( 'Cannot set to undefined state');
      }
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
      /* istanbul ignore next */
      if(typeof nonce=='number' && parseInt(nonce) == nonce){
        this._sm.nonce = nonce;
      } else {
        /* istanbul ignore next */
        throw Error("NONCE should be number ");
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
