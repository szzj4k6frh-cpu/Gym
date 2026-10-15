const KEY='gym-rest:v1';
const validDuration=value=>Number.isFinite(value)&&value>0&&value<=3600;
export function createTimer(now=()=>Date.now(),storage=null) {
 let deadline=null,duration=120;
 try {
  const raw=storage?.getItem(KEY);
  if(raw){const saved=JSON.parse(raw);if(saved.version===1&&validDuration(saved.duration)&&(saved.deadline===null||Number.isFinite(saved.deadline)&&saved.deadline>0&&saved.deadline<=now()+3600000)){deadline=saved.deadline;duration=saved.duration;}}
 }catch{/* Timer storage is optional; training storage reports its own failures. */}
 function save(){try{storage?.setItem(KEY,JSON.stringify({version:1,deadline,duration}))}catch{/* Continue with this session's timer. */}}
 return {
  getDuration:()=>duration,
  setDuration(seconds){if(!validDuration(seconds))throw RangeError('Pausendauer');duration=seconds;save();},
  start(seconds=duration){if(!validDuration(seconds))throw RangeError('Pausendauer');duration=seconds;deadline=now()+seconds*1000;save();},
  stop(){deadline=null;save();},
  remaining(){return deadline===null?null:Math.max(0,Math.ceil((deadline-now())/1000));}
 };
}
