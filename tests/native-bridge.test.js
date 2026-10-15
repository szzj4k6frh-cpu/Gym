import {test} from 'node:test';
import assert from 'node:assert/strict';
import {notifyRestStarted,notifyRestStopped} from '../src/native-bridge.js';
test('native bridge sends actual start deadline and stop',()=>{
 const calls=[];globalThis.window={webkit:{messageHandlers:{gymRest:{postMessage:body=>calls.push(body)}}}};
 try{notifyRestStarted(1792065600000,120);notifyRestStopped();assert.deepEqual(calls,[{action:'start',deadlineMs:1792065600000,durationSeconds:120},{action:'stop'}]);}finally{delete globalThis.window}
});
test('absent or throwing native bridge never blocks web training',()=>{
 assert.doesNotThrow(()=>notifyRestStarted(100000,180));globalThis.window={webkit:{messageHandlers:{gymRest:{postMessage(){throw Error('not available')}}}}};
 try{assert.doesNotThrow(()=>notifyRestStarted(100000,180));assert.doesNotThrow(()=>notifyRestStopped())}finally{delete globalThis.window}
});
