import {getGroups} from './plan.js';
import {dateKey,parseDateKey,weekday,addDays,weekDates} from './dates.js';
import {createStore} from './storage.js';
const $=id=>document.getElementById(id);
// Access to the localStorage property itself may throw in restricted browsers.
const store=createStore({getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)});
let selected=dateKey(new Date()),lastToday=selected;
const longDate=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long'});
const shortDate=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'short'});
const dayName=new Intl.DateTimeFormat('de-DE',{weekday:'long'});
function node(tag,className,text) {const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function render() {
 const focus=document.activeElement?.id;
 const date=parseDateKey(selected),today=dateKey(new Date()),day=store.getDay(selected),groups=getGroups(weekday(date),day.variant),week=weekDates(date);
 $('week-label').textContent=`${shortDate.format(week[0])} – ${shortDate.format(week[6])} ${week[6].getFullYear()}`;
 $('days').replaceChildren(...week.map(d=>{
  const key=dateKey(d),b=node('button','day'+(key===today?' is-today':''));b.id=`day-${key}`;b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',`${dayName.format(d)}, ${longDate.format(d)} ${d.getFullYear()}`);
  b.append(node('span','',dayName.format(d).slice(0,2)),node('strong','',String(d.getDate())));b.onclick=()=>{selected=key;render()};return b;
 }));
 $('date-label').textContent=`${selected===today?'HEUTE · ':''}${dayName.format(date)} · ${date.getFullYear()}`;
 $('selected-date').textContent=longDate.format(date);
 const exercises=groups.flatMap(g=>g.exercises),complete=exercises.filter(e=>day.done[e.id]).length;
 $('counter').textContent=exercises.length?`${complete} / ${exercises.length}`:'Ruhetag';
 $('progress-wrap').hidden=!exercises.length;$('progress').value=exercises.length?complete/exercises.length:0;
 $('variants').hidden=!groups.some(g=>g.id==='home'||g.id==='away');
 for(const variant of ['home','away'])$(variant).setAttribute('aria-pressed',String(day.variant===variant));
 $('warning').textContent=store.getWarning()??'';$('warning').hidden=!store.getWarning();
 $('content').replaceChildren(...groups.map(g=>{
  const section=node('section','group'),head=node('div','section-head');head.append(node('h3','',g.title),node('p','',g.note));section.append(head);
  for(const e of g.exercises) {
   const b=node('button','exercise');b.id=`exercise-${e.id}`;b.setAttribute('aria-pressed',String(!!day.done[e.id]));
   const tick=node('span','tick',day.done[e.id]?'✓':'');tick.setAttribute('aria-hidden','true');const info=node('span');info.append(node('span','exercise-name',e.name),node('span','prescription',e.prescription));if(e.hint)info.append(node('span','hint',e.hint));
   b.append(tick,info);b.onclick=()=>{store.toggle(selected,e.id);render()};section.append(b);
  }return section;
 }));
 if(!exercises.length){const rest=node('section','rest');rest.append(node('p','rest-icon','↟'),node('h3','','Regeneration / Fußball'),node('p','','Heute ist Platz zum Durchatmen. Dein nächstes Training wartet schon.'));$('content').append(rest);}
 $('reset').hidden=!exercises.length;
 if(focus)document.getElementById(focus)?.focus({preventScroll:true});
}
for(const [id,offset] of [['previous',-7],['next',7]])$(id).onclick=()=>{selected=dateKey(addDays(parseDateKey(selected),offset));render()};
$('today').onclick=()=>{selected=dateKey(new Date());lastToday=selected;render()};
for(const variant of ['home','away'])$(variant).onclick=()=>{store.setVariant(selected,variant);render()};
$('reset').onclick=()=>{if(confirm(`Alle Häkchen am ${longDate.format(parseDateKey(selected))} ${parseDateKey(selected).getFullYear()} zurücksetzen? Das gilt für Zuhause und Unterwegs.`)){store.resetDay(selected);render()}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){const now=dateKey(new Date());if(selected===lastToday)selected=now;lastToday=now;render()}});
render();
if('serviceWorker' in navigator) {
 navigator.serviceWorker.addEventListener('message',event=>{
  if(event.data==='READY'&&event.source===navigator.serviceWorker.controller)$('offline').textContent='Offline bereit';
 });
 const check=()=>navigator.serviceWorker.controller?.postMessage('CHECK_READY');
 navigator.serviceWorker.addEventListener('controllerchange',check);
 navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).then(()=>navigator.serviceWorker.ready).then(check).catch(()=>{$('offline').textContent='Offline noch nicht verfügbar'});
} else $('offline').textContent='Online nutzbar';
