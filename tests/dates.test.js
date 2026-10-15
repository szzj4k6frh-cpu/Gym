import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dateKey,parseDateKey,weekday,addDays,weekDates} from '../src/dates.js';
test('local calendar and Monday-based weeks',()=>{
 const d=parseDateKey('2026-10-15');assert.equal(weekday(d),3);
 assert.deepEqual(weekDates(d).map(dateKey),[12,13,14,15,16,17,18].map(n=>`2026-10-${n}`));
 for(const [a,b] of [['2026-12-31','2027-01-01'],['2026-03-28','2026-03-29'],['2026-03-29','2026-03-30'],['2026-10-25','2026-10-26']])assert.equal(dateKey(addDays(parseDateKey(a),1)),b);
 assert.equal(dateKey(new Date(2026,9,15,0,1)),'2026-10-15');
 assert.equal(dateKey(new Date(2026,9,15,23,59)),'2026-10-15');
 assert.throws(()=>parseDateKey('2026-02-30'));
});
