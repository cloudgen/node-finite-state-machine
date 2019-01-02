// This is the main entry point for "Node finite state machine"

const Config       = require('./util/jsm/config');
const Nonce        = require('./util/nonce');
const Factory      = require('./util/jsm/factory');
const AllPlugins   = require('./util/jsm/const/allPlugins');
const ApplyConfig  = require('./util/jsm/applyConfig');
const Defaults     = require('./util/jsm/const/defaults');
// This is the Main body of Node Finite State Machine
function NodeFSM(options) {
  return ApplyConfig(this, options, NodeFSM);
}

NodeFSM.version         = '1.0.0';

NodeFSM.defaults        = Defaults;

NodeFSM.NONCE           = Nonce;

// This is the Factory of Node Finite State Machine
NodeFSM.factory         = Factory;

// This is function convert existing objects into Finite State Machine
NodeFSM.apply           = ApplyConfig;

// This is the Enum of Plugin
NodeFSM.PLUGIN          = AllPlugins;

// The following plugin have been include as builtin plugins
NodeFSM.builtinPlugins  = [
  NodeFSM.PLUGIN.HISTORY,
  NodeFSM.PLUGIN.PERSISTENCE
];

module.exports          = NodeFSM;
