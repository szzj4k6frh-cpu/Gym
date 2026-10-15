import {parseDateKey} from './dates.js';
const KEY='gym-training:v1';
const empty=()=>({variant:'home',done:{}});
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function validate(data) {
 if(!object(data)||data.version!==1||!object(data.days))throw Error('schema');
 for(const [key,day] of Object.entries(data.days)) {
  parseDateKey(key);
  if(!object(day)||!['home','away'].includes(day.variant)||!object(day.done))throw Error('day');
  for(const [id,value] of Object.entries(day.done))if(!/^(home|away|neck|foot|athletic):[a-z-]+$/.test(id)||value!==true)throw Error('exercise');
 }
 return data;
}
export function createStore(storage) {
 let data={version:1,days:{}},warning=null,enabled=true;
 const fallback=()=>{enabled=false;warning='Speicherung nicht verfügbar. Änderungen bleiben nur in dieser Sitzung erhalten. Vorhandene Daten werden nicht überschrieben.'};
 try {const raw=storage.getItem(KEY);if(raw!==null)data=validate(JSON.parse(raw));}catch{fallback();}
 function getDay(key) {parseDateKey(key);return structuredClone(data.days[key]??empty());}
 function change(key,update) {
  const day=getDay(key);update(day);data.days[key]=day;
  if(enabled)try{storage.setItem(KEY,JSON.stringify(data));}catch{fallback();}
  return getDay(key);
 }
 return {
  getDay,getWarning:()=>warning,
  setVariant:(key,variant)=>{if(!['home','away'].includes(variant))throw Error('variant');return change(key,day=>{day.variant=variant})},
  toggle:(key,id)=>{if(!/^(home|away|neck|foot|athletic):[a-z-]+$/.test(id))throw Error('exercise');return change(key,day=>{if(day.done[id])delete day.done[id];else day.done[id]=true})},
  resetDay:key=>change(key,day=>{day.done={}})
 };
}
