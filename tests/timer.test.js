import {test} from 'node:test';import assert from 'node:assert/strict';import {createTimer} from '../src/timer.js';
test('rest timer uses elapsed wall time and can be stopped',()=>{let now=1000;const t=createTimer(()=>now);t.start(120);assert.equal(t.remaining(),120);now+=45000;assert.equal(t.remaining(),75);now+=90000;assert.equal(t.remaining(),0);t.stop();assert.equal(t.remaining(),null);assert.throws(()=>t.start(-1));});
test('timer restores deadline and selected duration after app reload',()=>{
 let now=1000;const memory={value:null,getItem(){return this.value},setItem(k,v){this.value=v}};
 const first=createTimer(()=>now,memory);first.setDuration(180);first.start();now+=75000;
 const restored=createTimer(()=>now,memory);assert.equal(restored.getDuration(),180);assert.equal(restored.remaining(),105);restored.stop();assert.equal(createTimer(()=>now,memory).remaining(),null);
});
test('duration selection does not start or restart a pause',()=>{
 let now=1000;const t=createTimer(()=>now);t.setDuration(180);assert.equal(t.remaining(),null);t.start();now+=10000;t.setDuration(120);assert.equal(t.remaining(),170);t.start();assert.equal(t.remaining(),120);
});
