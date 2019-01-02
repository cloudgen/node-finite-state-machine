const Config       = require('./config');
const FactoryBuild = require('./factoryBuild');

 // This function add the node finite state machine to an oject
module.exports =function (instance, options, factory) {
  if(factory==undefined){
    factory = this;
  }
  let config = new Config(options, factory);
  FactoryBuild(instance, config, factory);
  instance._sm();
  return instance;
}
