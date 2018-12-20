// This is the exception interface for "node finite state machine"

module.exports=function(m,r,f,t,c){
  this.message=m;
  this.transition=r;
  this.from=f;
  this.to=t;
  this.current=c;
}
