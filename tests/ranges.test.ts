import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allHands,combos,makeRange,positions,concreteHand} from '../src/ranges.ts';
test('169 classes describe all 1326 distinct two-card combinations',()=>{assert.equal(new Set(allHands).size,169);assert.equal(allHands.reduce((a,h)=>a+combos(h),0),1326);for(const h of allHands){const c=concreteHand(h);assert.notEqual(c[0],c[1]);}});
test('invalid contexts have no range',()=>{assert.equal(makeRange('BB',100,'UTG','open').size,0);assert.equal(makeRange('BTN',100,'SB','call').size,0);assert.equal(makeRange('BTN',NaN,'UTG','open').size,0);assert.equal(makeRange('BTN',0,'UTG','open').size,0)});
test('nine-max tournament positions follow action order',()=>{assert.deepEqual(positions,['UTG','UTG+1','UTG+2','LJ','HJ','CO','BTN','SB','BB']);});
test('unverified tournament strategies are never invented',()=>{for(const p of positions)for(const s of [20,40,100,200])for(const a of ['open','call','three'] as const)assert.equal(makeRange(p,s,'UTG',a).size,0);});
