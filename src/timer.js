export function createTimer(now=()=>Date.now()) {
 let deadline=null;
 return {
  start(seconds){if(!Number.isFinite(seconds)||seconds<=0||seconds>3600)throw RangeError('Pausendauer');deadline=now()+seconds*1000;},
  stop(){deadline=null;},
  remaining(){return deadline===null?null:Math.max(0,Math.ceil((deadline-now())/1000));}
 };
}
