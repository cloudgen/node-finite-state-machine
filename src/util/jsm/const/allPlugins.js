// preload all the plugins
const history     = require('../plugin/history');
const persistence = require('../plugin/persistence');
const visualize   = require('../plugin/visualize');

module.exports = {
  HISTORY: history,
  PERSISTENCE: persistence,
  VISUALIZE: visualize
}
