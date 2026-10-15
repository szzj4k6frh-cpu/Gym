import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../src/storage.js';
import {getExercise,exerciseSettings} from '../src/plan.js';
const memory=()=>({values:new Map(),getItem(k){return this.values.get(k)??null},setItem(k,v){this.values.set(k,v)}});
test('existing checkmarks migrate without overwriting original data',()=>{
 const m=memory(),old=JSON.stringify({version:1,days:{'2026-10-12':{variant:'away',done:{'away:pike':true}}}});m.setItem('gym-training:v1',old);
 const store=createStore(m);assert.equal(store.getDay('2026-10-12').done['away:pike'],true);
 store.updateSet('2026-10-14','home:press',0,{weight:12.5,reps:10,done:true});
 assert.equal(m.getItem('gym-training:v1'),old);assert.equal(createStore(m).getDay('2026-10-14').logs['home:press'][0].weight,12.5);
});
test('sets, optional third set, completion and undo',()=>{
 const s=createStore(memory()),date='2026-10-12';
 s.updateSet(date,'home:press',0,{weight:10,reps:8,done:true});assert.equal(s.getDay(date).done['home:press'],undefined);
 s.updateSet(date,'home:press',1,{weight:10,reps:7,done:true});assert.equal(s.getDay(date).done['home:press'],true);
 s.setCount(date,'home:press',3);assert.equal(s.getDay(date).done['home:press'],undefined);
 s.updateSet(date,'home:press',2,{done:true});assert.equal(s.getDay(date).done['home:press'],true);
 s.updateSet(date,'home:press',1,{done:false});assert.equal(s.getDay(date).done['home:press'],undefined);
 assert.throws(()=>s.updateSet(date,'home:press',0,{weight:-1}));assert.throws(()=>s.setCount(date,'home:lateral',3));
});
test('last results are earlier than selected day, same exercise only, with completed data',()=>{
 const s=createStore(memory());
 s.updateSet('2026-10-12','home:press',0,{weight:12,reps:10,done:true});s.updateSet('2026-10-14','home:press',0,{weight:14,reps:8,done:true});s.updateSet('2026-10-16','home:press',0,{weight:16,reps:6});
 assert.equal(s.lastResults('2026-10-16','home:press').date,'2026-10-14');assert.equal(s.lastResults('2026-10-14','home:press').sets[0].weight,12);assert.equal(s.lastResults('2026-10-12','home:press'),null);assert.equal(s.lastResults('2026-10-16','away:pike'),null);
});
test('date reset clears logs and all variants only for that day',()=>{
 const s=createStore(memory());for(const d of ['2026-10-12','2026-10-14'])s.updateSet(d,'home:press',0,{weight:12,reps:10,done:true});s.updateSet('2026-10-12','away:pike',0,{reps:8,done:true});s.resetDay('2026-10-12');assert.deepEqual(s.getDay('2026-10-12').logs,{});assert.ok(s.getDay('2026-10-14').logs['home:press']);
});
test('exercise settings follow plan and hints are available',()=>{
 assert.deepEqual(exerciseSettings('home:press'),{minSets:2,maxSets:3,metric:'reps',weighted:true});assert.equal(exerciseSettings('home:lateral').maxSets,2);assert.equal(exerciseSettings('foot:balance').metric,'seconds');assert.equal(exerciseSettings('athletic:sprint').minSets,4);assert.ok(getExercise('away:pike').instructions.length>15);
});
test('malformed v2 logs and inconsistent completion stay untouched',()=>{
 for(const set of [null,{weight:12,reps:-1,seconds:null,meters:null,done:true},{weight:12,reps:8,seconds:null,meters:null,done:true}]){
 const m=memory();const payload=JSON.stringify({version:2,days:{'2026-10-12':{variant:'home',done:{},logs:{'home:press':[set,set]}}}});m.setItem('gym-training:v2',payload);const s=createStore(m);s.toggle('2026-10-12','home:press');assert.ok(s.getWarning());assert.equal(m.getItem('gym-training:v2'),payload);
 }
});
