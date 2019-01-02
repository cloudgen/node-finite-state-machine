// If the global variable don't have a cache of regex, let's create it
/* istanbul ignore next */
if(!global._regex || !global._regex.camelize){
  global._regex = {
    camelize:
    /^[^A-Za-z0-9]*([a-z]+[A-Za-z0-9]*)|^[^A-Za-z0-9]*([A-Za-z0-9]+)|[^A-Za-z]*([a-z]+[A-Za-z0-9]*)|[^A-Za-z]*([A-Z]+[A-Za-z0-9]*)/g
  }
}

module.exports = function(){
  // We clone the arguments into a real array first
  return Array.
    prototype.
    slice.
    call(arguments).
    join('_').
    replace(
      global._regex.camelize,   // regex from global regex cache
      // first group:  ([a-z]+[A-Za-z0-9]*)
      // second group: ([A-Za-z0-9]+)
      // third group:  ([a-z]+[A-Za-z0-9]*)
      // fourth group: ([A-Z]+[A-Za-z0-9]*)
      function(wholeMatch, first, second, third, fourth){
        return (fourth)?
          (fourth.length==1 ?
            fourth:
            [
              fourth.charAt(0).toUpperCase(),
              fourth.substring(1).toLowerCase()
            ].join('')
          ):
          ((third)?
            /* istanbul ignore next */
            (third.length==1 ?
              third.toUpperCase():
              [
                third.charAt(0).toUpperCase(),
                third.substring(1)
              ].join('')):
            (first)?
              first:
              second.toLowerCase()
          );
      }
  );
}
