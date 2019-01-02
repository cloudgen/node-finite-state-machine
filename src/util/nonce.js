let instanceCount = 0;
module.exports = function(id){
  /* istanbul ignore next */
  if(typeof id=='undefined'){
    return ++instanceCount;
  }
  /* istanbul ignore next */
  if(typeof id=='number'){
    let newId = parseInt(id);
    /* istanbul ignore next */
    if(newId > instanceCount){
      /* istanbul ignore next */
      instanceCount = newId;
    }
  }
};
