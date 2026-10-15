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
test('packaged native UI works offline with set values, history and native timer messages',async({page,context})=>{
 await page.clock.install({time:new Date('2026-10-12T12:00:00+02:00')});
 await page.addInitScript(()=>{window.nativeCalls=[];window.webkit={messageHandlers:{gymRest:{postMessage:m=>window.nativeCalls.push(m)}}}});
 await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4173/')?route.continue():route.abort());
 await page.goto('/ios/Gym/Web/');await page.clock.setFixedTime(new Date('2026-10-12T12:00:00+02:00'));
 await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();const card=page.locator('.exercise').filter({has:page.getByText('Kurzhantel-Schulterdrücken',{exact:true})});
 await card.getByLabel('Gewicht Satz 1').fill('12,5');await card.getByLabel('Wiederholungen Satz 1').fill('10');await card.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();
 expect(await page.evaluate(()=>window.nativeCalls.at(-1))).toEqual({action:'start',deadlineMs:1791799320000,durationSeconds:120});
 await page.reload();await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await expect(card.getByLabel('Gewicht Satz 1')).toHaveValue('12,5');
 await context.setOffline(true);await page.getByRole('button',{name:/Mittwoch/}).click();await expect(card.locator('.last-results')).toContainText('12,5 kg');
 await card.getByLabel('Gewicht Satz 1').fill('14');await card.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();await page.getByRole('button',{name:'Timer stoppen'}).click();expect(await page.evaluate(()=>window.nativeCalls.at(-1))).toEqual({action:'stop'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.evaluate(()=>navigator.serviceWorker.controller)).toBeNull();
});
