import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const web='ios/Gym/Web';
test('local iOS bundle references only packaged files and uses a classic script',()=>{
 const html=readFileSync(`${web}/index.html`,'utf8');assert.ok(html.includes('<script defer src="./app.js"></script>'));assert.ok(!html.includes('type="module"'));
 for(const [,ref] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert.ok(existsSync(path.join(web,ref)),ref);
 const js=readFileSync(`${web}/app.js`,'utf8');assert.ok(!/^import\s/m.test(js));assert.ok(js.includes('gymRest'));assert.ok(!js.includes('serviceWorker.register'));
});
