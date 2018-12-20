// mixin try to copy the member property to the baseObject from another object

module.exports = function(baseObject){
  let nCount,singleArgument,element;
  for(nCount = 1; nCount<arguments.length; nCount++){
    singleArgument = arguments[nCount];
    for(element in singleArgument){
      if(singleArgument.hasOwnProperty(element)){
        baseObject[element] = singleArgument[element];
      }
    }
  }
  return baseObject;
}
