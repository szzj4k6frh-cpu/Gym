import {test,expect} from '@playwright/test';
async function waitForOffline(page) {
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
}
test.beforeEach(async({page})=>{await page.clock.install({time:new Date('2026-10-12T12:00:00+02:00')});});
test('training variants, persistence, history and reset',async({page})=>{
 await page.goto('/');await expect(page.locator('#counter')).toHaveText('0 / 15');
 await page.getByRole('button',{name:/Übung abschließen: Kurzhantel-Schulterdrücken/}).click();
 await page.getByRole('button',{name:/Übung abschließen: Short Foot/}).click();await expect(page.locator('#counter')).toHaveText('2 / 15');
 await page.getByRole('button',{name:'Unterwegs',exact:true}).click();await expect(page.locator('#counter')).toHaveText('1 / 14');
 await page.getByRole('button',{name:/Übung abschließen: Pike Push-ups/}).click();await page.reload();await expect(page.locator('#counter')).toHaveText('2 / 14');
 await page.getByRole('button',{name:'Vorherige Woche'}).click();await expect(page.locator('#counter')).toHaveText('0 / 15');
 await page.getByRole('button',{name:'Heute',exact:true}).click();await expect(page.locator('#counter')).toHaveText('2 / 14');
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Tag zurücksetzen'}).click();await expect(page.locator('#counter')).toHaveText('2 / 14');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Tag zurücksetzen'}).click();await expect(page.locator('#counter')).toHaveText('0 / 14');
 await page.getByRole('button',{name:'Zuhause',exact:true}).click();await expect(page.locator('#counter')).toHaveText('0 / 15');
 await page.getByRole('button',{name:/Dienstag/}).click();await expect(page.locator('#variants')).toBeHidden();
 await page.getByRole('button',{name:/Donnerstag/}).click();await expect(page.getByText('Regeneration / Fußball')).toBeVisible();await expect(page.locator('#reset')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
for(const failure of ['read','write','invalid'])test(`storage ${failure} failure has visible warning and working session`,async({page})=>{
 await page.addInitScript(mode=>{
 if(mode==='invalid')localStorage.setItem('gym-training:v1','broken');
 else Storage.prototype[mode==='read'?'getItem':'setItem']=()=>{throw new Error('denied')};
 },failure);
 await page.goto('/');await page.getByRole('button',{name:/Übung abschließen: Kurzhantel-Schulterdrücken/}).click();await expect(page.locator('#counter')).toHaveText('1 / 15');await expect(page.locator('#warning')).toContainText('nur in dieser Sitzung');
 if(failure==='invalid')expect(await page.evaluate(()=>localStorage.getItem('gym-training:v1'))).toBe('broken');
});
test('today follows midnight while history stays selected',async({page})=>{
 await page.goto('/');await page.clock.setFixedTime(new Date('2026-10-13T00:01:00+02:00'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('#counter')).toHaveText('0 / 3');
 await page.getByRole('button',{name:'Vorherige Woche'}).click();await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('#selected-date')).toContainText('6. Oktober');
 await page.getByRole('button',{name:'Heute',exact:true}).click();await expect(page.locator('#selected-date')).toContainText('14. Oktober');
});
for(const url of ['http://127.0.0.1:4173/','http://127.0.0.1:4174/Gym/'])test(`offline install and reload at ${url}`,async({page,context})=>{
 await page.goto(url);await waitForOffline(page);
 const manifest=await page.evaluate(async()=>await(await fetch(document.querySelector('link[rel=manifest]').href)).json());expect(manifest.display).toBe('standalone');expect(manifest.lang).toBe('de');
 for(const icon of manifest.icons){const response=await page.request.get(new URL(icon.src,url).href);expect(response.ok()).toBe(true)}
 await page.getByRole('button',{name:/Übung abschließen: Kurzhantel-Schulterdrücken/}).click();await context.setOffline(true);await page.reload();await expect(page.locator('#counter')).toHaveText('1 / 15');await waitForOffline(page);
 await page.getByRole('button',{name:'Unterwegs',exact:true}).click();await page.getByRole('button',{name:/Übung abschließen: Pike Push-ups/}).click();await page.reload();await expect(page.locator('#counter')).toHaveText('1 / 14');
});
test('failed cache never claims offline readiness',async({page,context})=>{
 const missing=context.waitForEvent('response',r=>r.url().endsWith('/missing-test-asset.png'));
 await page.goto('http://127.0.0.1:4175/');
 expect((await missing).status()).toBe(404);
 await expect.poll(()=>page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !r?.installing&&!r?.active})).toBe(true);
 expect(await page.evaluate(()=>navigator.serviceWorker.controller)).toBeNull();await expect(page.locator('#counter')).toHaveText('0 / 15');
});
test('late write failure preserves existing and new session checks',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Übung abschließen: Kurzhantel-Schulterdrücken/}).click();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('quota')}});
 await page.getByRole('button',{name:/Übung abschließen: Seitheben/}).click();await expect(page.locator('#counter')).toHaveText('2 / 15');await expect(page.locator('#warning')).toBeVisible();
 const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('gym-training:v2')));expect(Object.keys(persisted.days['2026-10-12'].done)).toHaveLength(1);
});
test('explicit history selection after foreground midnight is preserved',async({page})=>{
 await page.goto('/');await page.clock.setFixedTime(new Date('2026-10-13T00:01:00+02:00'));
 await page.getByRole('button',{name:/Dienstag/}).click();await page.getByRole('button',{name:/Montag/}).click();
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('#selected-date')).toHaveText('12. Oktober');
});
test('expanded exercise tracks individual sets, optional third and previous results',async({page})=>{
 const card=page.locator('.exercise').filter({has:page.getByText('Kurzhantel-Schulterdrücken',{exact:true})});
 await page.goto('/');await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();
 await card.getByLabel('Gewicht Satz 1').fill('12,5');await card.getByLabel('Wiederholungen Satz 1').fill('10');
 await card.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();
 await card.getByRole('button',{name:'Satz 2 abschließen',exact:true}).click();await expect(page.locator('#counter')).toHaveText('1 / 15');
 await card.getByRole('button',{name:'Dritten Satz hinzufügen'}).click();await expect(page.locator('#counter')).toHaveText('0 / 15');
 await card.getByRole('button',{name:'Satz 3 abschließen',exact:true}).click();await expect(page.locator('#counter')).toHaveText('1 / 15');
 await page.reload();await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await expect(card.getByLabel('Gewicht Satz 1')).toHaveValue('12,5');
 await page.getByRole('button',{name:/Mittwoch/}).click();await expect(page.locator('.last-results')).toContainText('12,5 kg');await expect(page.locator('.last-results')).toContainText('10 Wdh.');
 await card.getByText('Ausführung',{exact:true}).click();await expect(card.getByText(/Gewicht je Hantel eintragen/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('rest timer catches up after time elapsed',async({page})=>{
 await page.goto('/');await page.clock.setFixedTime(new Date('2026-10-12T12:00:00+02:00'));await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await page.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();await expect(page.locator('#timer-output')).toHaveText('2:00');
 await page.clock.setFixedTime(new Date('2026-10-12T12:01:15+02:00'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('#timer-output')).toHaveText('0:45');
 await page.getByRole('button',{name:'Timer stoppen'}).click();await expect(page.locator('#timer-output')).toHaveText('—');
});
test('legacy checks survive first set entry, migration and reload',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('migration-fixture')){localStorage.setItem('gym-training:v1',JSON.stringify({version:1,days:{'2026-10-12':{variant:'home',done:{'home:press':true}}}}));localStorage.setItem('migration-fixture','yes')}});
 await page.goto('/');await expect(page.locator('#counter')).toHaveText('1 / 15');await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();
 const field=page.getByLabel('Gewicht Satz 1').first();await field.fill('12,5');await page.reload();await expect(page.locator('#counter')).toHaveText('1 / 15');await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await expect(field).toHaveValue('12,5');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('gym-training:v1')).days['2026-10-12'].done['home:press'])).toBe(true);
});
test('set inputs also persist when offline',async({page,context})=>{
 await page.goto('/');await waitForOffline(page);await context.setOffline(true);await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await page.getByLabel('Gewicht Satz 1').first().fill('14');await page.reload();await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await expect(page.getByLabel('Gewicht Satz 1').first()).toHaveValue('14');
});
test('reset confirmation explicitly includes saved training values',async({page})=>{
 await page.goto('/');let message='';page.once('dialog',async dialog=>{message=dialog.message();await dialog.dismiss()});await page.getByRole('button',{name:'Tag zurücksetzen'}).click();expect(message).toMatch(/Satzwerte|Gewichte.*Wiederholungen/);
});
test('numeric editing has no grouping and iPhone-sized input text',async({page})=>{
 await page.goto('/');await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();const field=page.getByLabel('Gewicht Satz 1').first();await field.fill('1000');await page.reload();await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await expect(field).toHaveValue('1000');expect(await field.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
});
test('invalid numeric entry is not silently discarded by completing a set',async({page})=>{
 await page.goto('/');await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();const field=page.getByLabel('Gewicht Satz 1').first();await field.fill('abc');await page.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();await expect(field).toHaveValue('abc');await expect(field).toHaveAttribute('aria-invalid','true');await expect(page.getByRole('button',{name:'Satz 1 abschließen',exact:true})).toHaveAttribute('aria-pressed','false');
});
test('pause starts automatically after checking a set and survives reload',async({page})=>{
 await page.goto('/');await page.clock.setFixedTime(new Date('2026-10-12T12:00:00+02:00'));await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();
 await page.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();await expect(page.locator('#timer-output')).toHaveText('2:00');
 await page.clock.setFixedTime(new Date('2026-10-12T12:00:30+02:00'));await page.reload();await expect(page.locator('#timer-output')).toHaveText('1:30');
 await page.getByRole('button',{name:'3 Min.',exact:true}).click();await expect(page.locator('#timer-output')).toHaveText('1:30');
 await page.getByText('Kurzhantel-Schulterdrücken',{exact:true}).click();await page.getByRole('button',{name:'Satz 1 abschließen',exact:true}).click();await expect(page.locator('#timer-output')).toHaveText('1:30');
 await page.getByRole('button',{name:'Satz 2 abschließen',exact:true}).click();await expect(page.locator('#timer-output')).toHaveText('3:00');
});
