import {test,expect} from '@playwright/test';
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
