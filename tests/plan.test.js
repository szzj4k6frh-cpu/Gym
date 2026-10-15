import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getGroups} from '../src/plan.js';
test('weekly totals and stable shared exercises',()=>{
 for(const [v,counts] of [['home',[15,3,15,0,13,0,0]],['away',[14,3,14,0,12,0,0]]]) {
 assert.deepEqual(counts.map((_,i)=>getGroups(i,v).flatMap(g=>g.exercises).length),counts);
 }
 assert.deepEqual(getGroups(0,'home').slice(1),getGroups(0,'away').slice(1));
});
test('specific plan prescriptions',()=>{
 const home=getGroups(0,'home')[0].exercises;
 assert.deepEqual(home.map(e=>[e.name,e.prescription]),[
 ['Kurzhantel-Schulterdrücken','2–3 × 6–10'],['Seitheben','2 × 10–15'],['Butterfly','2–3 × 6–10'],['Enger Latzug','2–3 × 6–10'],['Sitzendes Kabelrudern','2–3 × 6–10'],['Trizeps-Pushdowns','2–3 × 6–10'],['Preacher Curls','2–3 × 6–10'],['Stehender Beinbeuger (einbeinig)','2–3 × 6–10 je Bein'],['Goblet Squats','2–3 × 6–10']]);
 assert.deepEqual(getGroups(0,'away')[0].exercises.map(e=>[e.name,e.prescription]),[
 ['Pike Push-ups','2–3 × 6–12'],['Breite Liegestütze','2–3 × 8–15'],['Reverse Snow Angels (Rücken)','2–3 × 12–15'],['Superman Pulls (Rücken)','2–3 × 10–15'],['Enge Liegestütze (Trizeps)','2–3 × 6–12'],['Selbstwiderstands-Curls (Bizeps)','2–3 × 10–15'],['Sliding Leg Curls (Handtuch)','2–3 × 8–12'],['Bulgarian Split Squats','2–3 × 8–12 je Bein']]);
 assert.equal(new Set(home.map(e=>e.id)).size,9);
});
