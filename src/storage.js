import {parseDateKey} from './dates.js';
import {exerciseSettings} from './plan.js';
const KEY='gym-training:v2',LEGACY='gym-training:v1';
const empty=()=>({variant:'home',done:{},logs:{}});
const blankSet=()=>({weight:null,reps:null,seconds:null,meters:null,done:false});
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const validId=id=>/^(home|away|neck|foot|athletic):[a-z-]+$/.test(id);
function validSet(set) {
 if(!object(set)||typeof set.done!=='boolean')return false;
 const limits={weight:2000,reps:10000,seconds:86400,meters:100000};
 return Object.keys(set).every(k=>k==='done'||k in limits)&&Object.entries(limits).every(([key,max])=>set[key]===null||typeof set[key]==='number'&&Number.isFinite(set[key])&&set[key]>=0&&set[key]<=max&&(key!=='reps'||Number.isInteger(set[key])));
}
function validate(data,version) {
 if(!object(data)||data.version!==version||!object(data.days))throw Error('schema');
 for(const [key,day] of Object.entries(data.days)) {
  parseDateKey(key);
  if(!object(day)||!['home','away'].includes(day.variant)||!object(day.done))throw Error('day');
  for(const [id,value] of Object.entries(day.done))if(!validId(id)||value!==true)throw Error('exercise');
  if(version===2){
   if(!object(day.logs))throw Error('logs');
   for(const [id,sets] of Object.entries(day.logs)){
    const {minSets,maxSets}=exerciseSettings(id);
    if(!Array.isArray(sets)||sets.length<minSets||sets.length>maxSets||!sets.every(validSet))throw Error('sets');
    if(sets.every(set=>set.done)!==!!day.done[id])throw Error('completion');
   }
  }
 }
 return data;
}
export function createStore(storage) {
 let data={version:2,days:{}},warning=null,enabled=true;
 const fallback=()=>{enabled=false;warning='Speicherung nicht verfügbar. Änderungen bleiben nur in dieser Sitzung erhalten. Vorhandene Daten werden nicht überschrieben.'};
 try {
  const raw=storage.getItem(KEY);
  if(raw!==null)data=validate(JSON.parse(raw),2);
  else {const old=storage.getItem(LEGACY);if(old!==null){const parsed=validate(JSON.parse(old),1);data.days=Object.fromEntries(Object.entries(parsed.days).map(([key,day])=>[key,{...day,logs:{}}]));}}
 }catch{fallback();}
 function getDay(key) {parseDateKey(key);return structuredClone(data.days[key]??empty());}
 function change(key,update) {
  const day=getDay(key);update(day);data.days[key]=day;
  if(enabled)try{storage.setItem(KEY,JSON.stringify(data));}catch{fallback();}
  return getDay(key);
 }
 function setsFor(day,id) {return day.logs[id]??Array.from({length:exerciseSettings(id).minSets},()=>({...blankSet(),done:!!day.done[id]}));}
 function sync(day,id) {if(day.logs[id].every(s=>s.done))day.done[id]=true;else delete day.done[id];}
 return {
  getDay,getWarning:()=>warning,
  getSets:(key,id)=>structuredClone(setsFor(getDay(key),id)),
  setVariant:(key,variant)=>{if(!['home','away'].includes(variant))throw Error('variant');return change(key,day=>{day.variant=variant})},
  toggle:(key,id)=>{if(!validId(id))throw Error('exercise');return change(key,day=>{const checked=!day.done[id];if(checked)day.done[id]=true;else delete day.done[id];if(day.logs[id])day.logs[id].forEach(s=>{s.done=checked})})},
  updateSet:(key,id,index,patch)=>change(key,day=>{
   const sets=setsFor(day,id);if(!Number.isInteger(index)||index<0||index>=sets.length)throw RangeError('Satz');
   const next={...sets[index],...patch};if(!validSet(next))throw RangeError('Ungültiger Satzwert');
   sets[index]=next;day.logs[id]=sets;sync(day,id);
  }),
  setCount:(key,id,count)=>change(key,day=>{
   const {minSets,maxSets}=exerciseSettings(id);if(!Number.isInteger(count)||count<minSets||count>maxSets)throw RangeError('Satzanzahl');
   const sets=setsFor(day,id);day.logs[id]=Array.from({length:count},(_,i)=>sets[i]??blankSet());sync(day,id);
  }),
  lastResults:(key,id)=>{
   parseDateKey(key);
   for(const date of Object.keys(data.days).filter(d=>d<key).sort().reverse()) {
    const sets=data.days[date].logs[id]?.filter(s=>s.done&&[s.weight,s.reps,s.seconds,s.meters].some(v=>v!==null));
    if(sets?.length)return {date,sets:structuredClone(sets)};
   }return null;
  },
  resetDay:key=>change(key,day=>{day.done={};day.logs={}})
 };
}
