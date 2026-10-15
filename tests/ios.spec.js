import {test,expect} from '@playwright/test';
test('native bridge: only new completed sets start; duration changes and undo do not',async({page})=>{
 await page.clock.install({time:new Date('2026-10-12T12:00:00+02:00')});
 await page.addInitScript(()=>{window.nativeCalls=[];window.webkit={messageHandlers:{gymRest:{postMessage:m=>window.nativeCalls.push(m)}}}});
 await page.goto('/');await page.clock.setFixedTime(new Date('2026-10-12T12:00:00+02:00'));
 await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await page.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();
 expect(await page.evaluate(()=>window.nativeCalls)).toEqual([{action:'start',deadlineMs:1791799320000,durationSeconds:120}]);
 await page.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();await page.getByRole('button',{name:'3 Min.',exact:true}).click();expect(await page.evaluate(()=>window.nativeCalls.length)).toBe(1);
 await page.getByRole('button',{name:'Timer stoppen'}).click();expect(await page.evaluate(()=>window.nativeCalls.at(-1))).toEqual({action:'stop'});
});
