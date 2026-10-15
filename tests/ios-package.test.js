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
test('Xcode package includes embedded activity and local web resources',()=>{
 const project=readFileSync('ios/Gym.xcodeproj/project.pbxproj','utf8');
 for(const value of ['com.apple.product-type.application','com.apple.product-type.app-extension','Embed App Extensions','RestActivityAttributes.swift','Web','GymActivity.appex','DEVELOPMENT_TEAM','18.0'])assert.ok(project.includes(value),value);
 assert.ok(!project.includes('aps-environment'));assert.ok(!project.includes('com.apple.security.application-groups'));
 const scheme=readFileSync('ios/Gym.xcodeproj/xcshareddata/xcschemes/Gym.xcscheme','utf8');assert.ok(scheme.includes('Gym.app'));
 assert.ok(readFileSync('ios/Gym/Info.plist','utf8').includes('NSSupportsLiveActivities'));
 assert.ok(readFileSync('ios/GymActivity/Info.plist','utf8').includes('com.apple.widgetkit-extension'));
});
