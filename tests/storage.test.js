import {test} from 'node:test';import assert from 'node:assert/strict';
import {createStore} from '../src/storage.js';
const memory=(initial=null)=>({value:initial,getItem(){return this.value},setItem(k,v){this.value=v}});
const day='2026-10-12';
test('variants, shared extras, reload and date-limited reset',()=>{
 const m=memory(),s=createStore(m);s.toggle(day,'home:press');s.toggle(day,'foot:short-foot');s.setVariant(day,'away');s.toggle(day,'away:pike');s.toggle('2026-10-13','foot:short-foot');
 const reloaded=createStore(m);assert.equal(reloaded.getDay(day).variant,'away');assert.equal(Object.keys(reloaded.getDay(day).done).length,3);
 assert.deepEqual(reloaded.resetDay(day),{variant:'away',done:{}});assert.equal(reloaded.getDay('2026-10-13').done['foot:short-foot'],true);
});
test('toggle twice removes a check and snapshots cannot mutate store',()=>{const s=createStore(memory());s.toggle(day,'home:press');s.toggle(day,'home:press');assert.deepEqual(s.getDay(day).done,{});s.getDay(day).done.x=true;assert.deepEqual(s.getDay(day).done,{});});
for(const payload of ['{','null','{"version":2,"days":{}}','{"version":1,"days":{"2026-02-30":{"variant":"home","done":{}}}}','{"version":1,"days":{"2026-10-12":{"variant":"bad","done":{}}}}','{"version":1,"days":{"__proto__":{}}}','{"version":1,"days":{"2026-10-12":{"variant":"home","done":{"home:press":"yes"}}}}']) {
 test(`invalid data preserved: ${payload}`,()=>{const m=memory(payload),s=createStore(m);s.toggle(day,'home:press');assert.equal(m.value,payload);assert.ok(s.getWarning());assert.equal(s.getDay(day).done['home:press'],true)});
}
test('reading and late write failure retain session state',()=>{
 const s=createStore({getItem(){throw Error('denied')}});s.toggle(day,'home:press');assert.ok(s.getWarning());assert.equal(s.getDay(day).done['home:press'],true);
 const m=memory(),other=createStore(m);other.toggle(day,'home:press');m.setItem=()=>{throw Error('quota')};other.toggle(day,'away:pike');assert.equal(other.getDay(day).done['away:pike'],true);assert.ok(other.getWarning());
});
