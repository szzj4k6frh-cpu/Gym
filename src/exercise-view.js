import {getExercise,exerciseSettings} from './plan.js';
import {parseDateKey} from './dates.js';
const number=new Intl.NumberFormat('de-DE',{maximumFractionDigits:2});
function el(tag,className,text) {const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function guardInvalid(card) {
 const input=card.querySelector('input[aria-invalid="true"]');
 if(!input)return false;input.focus();input.reportValidity();return true;
}
function formatSet(set) {
 const parts=[];
 if(set.weight!==null)parts.push(`${number.format(set.weight)} kg`);
 if(set.reps!==null)parts.push(`${set.reps} Wdh.`);
 if(set.seconds!==null)parts.push(`${number.format(set.seconds)} Sek.`);
 if(set.meters!==null)parts.push(`${number.format(set.meters)} m`);
 return parts.join(' · ');
}
export function exerciseView({exercise,date,store,expanded,onChange,onSetDone}) {
 const day=store.getDay(date),settings=exerciseSettings(exercise.id),sets=store.getSets(date,exercise.id);
 const card=el('article','exercise'+(day.done[exercise.id]?' is-done':''));
 const complete=el('button','tick exercise-toggle',day.done[exercise.id]?'✓':'');
 complete.id=`exercise-${exercise.id}`;complete.setAttribute('aria-label',`Übung abschließen: ${exercise.name}`);complete.setAttribute('aria-pressed',String(!!day.done[exercise.id]));
 complete.onclick=()=>{if(guardInvalid(card))return;store.toggle(date,exercise.id);onChange()};card.append(complete);
 const details=el('details','exercise-details');details.open=expanded.has(exercise.id);details.ontoggle=()=>{if(details.open)expanded.add(exercise.id);else expanded.delete(exercise.id)};
 const summary=el('summary','exercise-summary');summary.append(el('span','exercise-name',exercise.name),el('span','prescription',exercise.prescription),el('span','expand-mark','⌄'));details.append(summary);
 const body=el('div','exercise-body');
 const previous=store.lastResults(date,exercise.id);
 if(previous){const text=el('p','last-results',`Zuletzt (${new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'numeric'}).format(parseDateKey(previous.date))}): ${previous.sets.map(formatSet).filter(Boolean).join(' / ')}`);body.append(text);}
 const grid=el('div','set-grid');
 sets.forEach((set,index)=>{
  const row=el('div','set-row');row.append(el('span','set-number',`${index+1}`));
  const metric=settings.metric;
  for(const field of [...(settings.weighted?['weight']:[]),metric]){
   const labels={weight:'Gewicht',reps:'Wiederholungen',seconds:'Sekunden',meters:'Meter'};
   const wrap=el('label','set-field'),label=el('span','field-label',field==='weight'?'kg':field==='reps'?'Wdh.':field==='seconds'?'Sek.':'m');
   const input=el('input');input.type='text';input.inputMode=field==='reps'?'numeric':'decimal';input.autocomplete='off';input.id=`set-${exercise.id}-${index}-${field}`;input.setAttribute('aria-label',`${labels[field]} Satz ${index+1}`);input.value=set[field]===null?'':String(set[field]).replace('.',',');input.placeholder='—';
   input.oninput=()=>{
    const raw=input.value.trim().replace(',','.');
    const valid=raw===''||/^\d+(?:\.\d*)?$/.test(raw);
    if(!valid){input.setAttribute('aria-invalid','true');input.setCustomValidity('Bitte eine gültige Zahl eingeben.');return;}
    try{store.updateSet(date,exercise.id,index,{[field]:raw===''?null:Number(raw)});input.removeAttribute('aria-invalid');input.setCustomValidity('');onChange(false)}catch{input.setAttribute('aria-invalid','true');input.setCustomValidity('Bitte eine gültige Zahl eingeben.');}
   };
   wrap.append(label,input);row.append(wrap);
  }
  const tick=el('button','set-tick',set.done?'✓':'');tick.id=`set-${exercise.id}-${index}-done`;tick.setAttribute('aria-label',`Satz ${index+1} abschließen`);tick.setAttribute('aria-pressed',String(set.done));tick.onclick=()=>{if(guardInvalid(card))return;store.updateSet(date,exercise.id,index,{done:!set.done});if(!set.done)onSetDone();onChange()};row.append(tick);grid.append(row);
 });
 body.append(grid);
 if(settings.maxSets>settings.minSets){
  const extra=el('button','extra-set',sets.length<settings.maxSets?'+ Dritter Satz':'− Dritten Satz entfernen');extra.setAttribute('aria-label',sets.length<settings.maxSets?'Dritten Satz hinzufügen':'Dritten Satz entfernen');
  extra.onclick=()=>{
   if(guardInvalid(card))return;
   const removing=sets.length===settings.maxSets;
   const last=sets.at(-1);
   if(removing&&(last.done||[last.weight,last.reps,last.seconds,last.meters].some(v=>v!==null))&&!confirm('Dritten Satz mit seinen Einträgen entfernen?'))return;
   store.setCount(date,exercise.id,removing?settings.minSets:settings.maxSets);onChange();
  };body.append(extra);
 }
 const help=el('details','exercise-help'),helpTitle=el('summary','','Ausführung');help.open=expanded.has(`${exercise.id}:help`);help.ontoggle=()=>{if(help.open)expanded.add(`${exercise.id}:help`);else expanded.delete(`${exercise.id}:help`)};help.append(helpTitle,el('p','',getExercise(exercise.id).instructions));body.append(help);details.append(body);card.append(details);return card;
}
