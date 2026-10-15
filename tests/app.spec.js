import {test,expect} from '@playwright/test';
async function waitForOffline(page) {
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
}
test.beforeEach(async({page})=>{await page.clock.install({time:new Date('2026-10-12T12:00:00+02:00')});});
test('training variants, persistence, history and reset',async({page})=>{
 await page.goto('/');await expect(page.locator('#counter')).toHaveText('0 / 15');
 await page.getByRole('button',{name:/Kurzhantel-Schulterdrücken/}).click();
 await page.getByRole('button',{name:/Short Foot/}).click();await expect(page.locator('#counter')).toHaveText('2 / 15');
 await page.getByRole('button',{name:'Unterwegs',exact:true}).click();await expect(page.locator('#counter')).toHaveText('1 / 14');
 await page.getByRole('button',{name:/Pike Push-ups/}).click();await page.reload();await expect(page.locator('#counter')).toHaveText('2 / 14');
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
 await page.goto('/');await page.getByRole('button',{name:/Kurzhantel-Schulterdrücken/}).click();await expect(page.locator('#counter')).toHaveText('1 / 15');await expect(page.locator('#warning')).toContainText('nur in dieser Sitzung');
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
 await page.getByRole('button',{name:/Kurzhantel-Schulterdrücken/}).click();await context.setOffline(true);await page.reload();await expect(page.locator('#counter')).toHaveText('1 / 15');await waitForOffline(page);
 await page.getByRole('button',{name:'Unterwegs',exact:true}).click();await page.getByRole('button',{name:/Pike Push-ups/}).click();await page.reload();await expect(page.locator('#counter')).toHaveText('1 / 14');
});
test('failed cache never claims offline readiness',async({page,context})=>{
 const missing=context.waitForEvent('response',r=>r.url().endsWith('/missing-test-asset.png'));
 await page.goto('http://127.0.0.1:4175/');
 expect((await missing).status()).toBe(404);
 await expect.poll(()=>page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !r?.installing&&!r?.active})).toBe(true);
 expect(await page.evaluate(()=>navigator.serviceWorker.controller)).toBeNull();await expect(page.locator('#counter')).toHaveText('0 / 15');
});
test('late write failure preserves existing and new session checks',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Kurzhantel-Schulterdrücken/}).click();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('quota')}});
 await page.getByRole('button',{name:/Seitheben/}).click();await expect(page.locator('#counter')).toHaveText('2 / 15');await expect(page.locator('#warning')).toBeVisible();
 const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('gym-training:v1')));expect(Object.keys(persisted.days['2026-10-12'].done)).toHaveLength(1);
});
test('explicit history selection after foreground midnight is preserved',async({page})=>{
 await page.goto('/');await page.clock.setFixedTime(new Date('2026-10-13T00:01:00+02:00'));
 await page.getByRole('button',{name:/Dienstag/}).click();await page.getByRole('button',{name:/Montag/}).click();
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('#selected-date')).toHaveText('12. Oktober');
});
