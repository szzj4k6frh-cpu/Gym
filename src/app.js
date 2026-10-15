import {getGroups} from './plan.js';
import {exerciseView} from './exercise-view.js';
import {createTimer} from './timer.js';
import {dateKey,parseDateKey,weekday,addDays,weekDates} from './dates.js';
import {createStore} from './storage.js';
const $=id=>document.getElementById(id);
// Access to the localStorage property itself may throw in restricted browsers.
const store=createStore({getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)});
let selected=dateKey(new Date()),lastToday=selected;
const expanded=new Set();
const timer=createTimer(()=>Date.now(),{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
const longDate=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long'});
const shortDate=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'short'});
const dayName=new Intl.DateTimeFormat('de-DE',{weekday:'long'});
function node(tag,className,text) {const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function refresh(full=true) {
 if(full)render();
 else { $('warning').textContent=store.getWarning()??'';$('warning').hidden=!store.getWarning(); }
}
function render() {
 const focus=document.activeElement?.id;
 const date=parseDateKey(selected),today=dateKey(new Date()),day=store.getDay(selected),groups=getGroups(weekday(date),day.variant),week=weekDates(date);
 $('week-label').textContent=`${shortDate.format(week[0])} – ${shortDate.format(week[6])} ${week[6].getFullYear()}`;
 $('days').replaceChildren(...week.map(d=>{
  const key=dateKey(d),b=node('button','day'+(key===today?' is-today':''));b.id=`day-${key}`;b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',`${dayName.format(d)}, ${longDate.format(d)} ${d.getFullYear()}`);
  b.append(node('span','',dayName.format(d).slice(0,2)),node('strong','',String(d.getDate())));b.onclick=()=>{selected=key;lastToday=dateKey(new Date());render()};return b;
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
  for(const exercise of g.exercises)section.append(exerciseView({exercise,date:selected,store,expanded,onChange:refresh,onSetDone:()=>startTimer()}));
  return section;
 }));
 if(!exercises.length){const rest=node('section','rest');rest.append(node('p','rest-icon','↟'),node('h3','','Regeneration / Fußball'));$('content').append(rest);}
 $('reset').hidden=!exercises.length;
 if(focus)document.getElementById(focus)?.focus({preventScroll:true});
}
for(const [id,offset] of [['previous',-7],['next',7]])$(id).onclick=()=>{selected=dateKey(addDays(parseDateKey(selected),offset));lastToday=dateKey(new Date());render()};
$('today').onclick=()=>{selected=dateKey(new Date());lastToday=selected;render()};
for(const variant of ['home','away'])$(variant).onclick=()=>{store.setVariant(selected,variant);render()};
$('reset').onclick=()=>{if(confirm(`Alle Häkchen und Satzwerte (Gewichte, Wiederholungen und Zeiten) am ${longDate.format(parseDateKey(selected))} ${parseDateKey(selected).getFullYear()} zurücksetzen? Das gilt für Zuhause und Unterwegs.`)){store.resetDay(selected);render()}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){updateTimer();const now=dateKey(new Date());if(selected===lastToday)selected=now;lastToday=now;render()}});
function updateTimer() {
 const remaining=timer.remaining();
 $('timer-output').textContent=remaining===null?'—':remaining===0?'Pause beendet':`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
 $('timer-stop').hidden=remaining===null;
 for(const seconds of [120,180])$(`timer-${seconds}`).setAttribute('aria-pressed',String(timer.getDuration()===seconds));
}
function startTimer() {timer.start();updateTimer();}
for(const seconds of [120,180])$(`timer-${seconds}`).onclick=()=>{timer.setDuration(seconds);updateTimer()};
$('timer-stop').onclick=()=>{timer.stop();updateTimer()};
setInterval(updateTimer,250);
updateTimer();

render();
if('serviceWorker' in navigator) {
 navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).catch(()=>{});
}
