const fs = require('fs');

module.exports = function(options) { options = options || {};
  var plugin = {
    change: function(instance, state) {
      instance.save(instance.filename,state)
    },
    methods:    {},
    properties: {}
  }
  plugin.pluginName='persistence';
  plugin.methods['load'] = function(filename) {
    /* istanbul ignore next */
    if(filename && filename != ''){
      this.filename=filename;
    }
    /* istanbul ignore next */
    if(this.filename && this.filename !=''){
      /* istanbul ignore next */
      if(fs.existsSync(this.filename)){
        var obj = JSON.parse(fs.readFileSync(this.filename, 'utf8'));
        for(var i in obj){
          if(typeof obj[i] != "object"){
            this[i] = obj[i];
            /* istanbul ignore next */
          }else if(Array.isArray(obj[i])){
            this[i] = obj[i].slice(0,obj[i].length);
          }
        }
      }
    }
  }
  plugin.methods['save'] = function(filename,state) {
    if(filename && filename != ''){
      this.filename=filename;
    }
    if(this.filename && this.filename !=''){
      var state = typeof state == 'undefined' ? this.state : state
      var obj={state: state};
      for(var i in this){
        if(typeof this[i] != 'function' && i!='state'){
          if(typeof this[i] != 'object'){
            obj[i] = this[i];
          } else if(Array.isArray(this[i])){
            /* istanbul ignore next */
            if(typeof obj[i]=='undefined'){
              obj[i]=[];
            }
            for(var j in this[i]){
              /* istanbul ignore next */
              if(typeof this[i][j]!= 'function' && typeof this[i][j]!= 'object'){
                obj[i].push(this[i][j]);
              }
            }
          }
        }
      }
      fs.writeFileSync(this.filename,JSON.stringify(obj));
    }
  }

  plugin.properties['filename'] = {
    get: function() {
      return this._sm.filename;
    },
    set: function(filename){
      this._sm.filename = filename;
    }
  }
  return plugin;
}
