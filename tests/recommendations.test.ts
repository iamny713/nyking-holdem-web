import {test} from 'node:test';
import assert from 'node:assert/strict';
import {positions,allHands} from '../src/ranges.ts';
import {depths,recommend,coverage,expand,type Move} from '../src/recommendations.ts';
const moves:Move[]=['open','call','three','jam','fold'];
test('notation expands pair, fixed-high suited/offsuit plus, and wheel intervals correctly',()=>{
 assert.deepEqual([...expand('TT+')],['AA','KK','QQ','JJ','TT']);
 assert.deepEqual([...expand('A5s-A4s')],['A5s','A4s']);
 assert.equal(expand('KTs+').size,3);assert.ok(expand('KTs+').has('KQs'));assert.ok(!expand('KTs+').has('AKs'));
 assert.equal(expand('AJo+').size,3);assert.equal(expand('AA AA').size,1);assert.throws(()=>expand('A1s'));
});
test('every supported context has 169 exclusive decisions and conserves 1326 combos',()=>{
 let contexts=0;
 for(const depth of depths.filter(d=>d>10))for(const [i,p] of positions.entries()){
  const contextsForPosition=[...(p==='BB'?[]:[{scenario:'open' as const,opener:''}]),...positions.slice(0,i).map(opener=>({scenario:'response' as const,opener}))];
  for(const c of contextsForPosition){
   const r=recommend(p,depth,c.opener,c.scenario)!;assert.ok(r);contexts++;assert.equal(Object.keys(r.decisions).length,169);
   assert.ok(Math.abs(moves.reduce((n,m)=>n+coverage(r,m),0)-1)<1e-9);
   for(const h of allHands){const d=r.decisions[h];assert.ok(moves.includes(d.move));assert.ok(d.reason.length>30);assert.ok(d.principles.length>=2);if(c.scenario==='open')assert.ok(!['call','three'].includes(d.move));else assert.notEqual(d.move,'open');if(d.move==='three'){assert.ok(r.sizes.three&&r.sizes.three<depth)}if(depth<=20)assert.notEqual(d.move,'three');}
   assert.equal(r.decisions.AA.move,c.scenario==='open'?'open':depth<=20?'jam':'three');
  }
 }
 assert.equal(contexts,352);
});
test('rejects impossible positions, action order and unsupported depths',()=>{assert.equal(recommend('BB',30,'','open'),null);assert.equal(recommend('UTG',30,'BTN','response'),null);assert.equal(recommend('BTN',30,'BTN','response'),null);assert.equal(recommend('BTN',37,'CO','response'),null);assert.equal(recommend('BTN',NaN,'CO','response'),null);assert.equal(recommend('UNKNOWN',30,'CO','open'),null)});
test('authored hand choices change materially with position and stack',()=>{
 assert.equal(recommend('UTG',15,'','open')!.decisions['55'].move,'fold');
 assert.equal(recommend('UTG',100,'','open')!.decisions['55'].move,'open');
 assert.equal(recommend('HJ',15,'','open')!.decisions['66'].move,'jam');
 assert.equal(recommend('HJ',40,'','open')!.decisions['66'].move,'open');
 assert.equal(recommend('BTN',40,'CO','response')!.decisions['A5s'].move,'three');
 assert.equal(recommend('BTN',15,'CO','response')!.decisions['A5s'].move,'fold');
 assert.notDeepEqual(recommend('BTN',30,'UTG','response')!.decisions,recommend('BTN',30,'CO','response')!.decisions);
});
test('BB defense and simplified SB strategy stay distinct; SB opening size is carried into response',()=>{
 assert.equal(recommend('BB',40,'BTN','response')!.decisions['98s'].move,'call');
 for(const depth of depths.filter(d=>d>10))for(const o of positions.slice(0,7)){const r=recommend('SB',depth,o,'response')!;assert.equal(coverage(r,'call'),0)}
 assert.equal(recommend('BB',30,'SB','response')!.sizes.open,recommend('SB',30,'','open')!.sizes.open);
});

test('1–10BB AOF has distinct first-in pushes and calls versus a shove in all 440 valid contexts',()=>{
 let count=0;
 for(const d of depths.filter(d=>d<=10))for(const [i,p] of positions.entries()){
  if(p!=='BB'){
   const r=recommend(p,d,'','open')!;assert.ok(r);count++;assert.equal(r.decisions.AA.move,'jam');
   assert.ok(allHands.every(h=>['jam','fold'].includes(r.decisions[h].move)));
   assert.ok(Math.abs(coverage(r,'jam')+coverage(r,'fold')-1)<1e-9);
  }
  for(const o of positions.slice(0,i)){
   const r=recommend(p,d,o,'facingJam')!;assert.ok(r);count++;assert.equal(r.decisions.AA.move,'callJam');
   assert.ok(allHands.every(h=>['callJam','fold'].includes(r.decisions[h].move)));
   assert.ok(Math.abs(coverage(r,'callJam')+coverage(r,'fold')-1)<1e-9);
  }
 }
 assert.equal(count,440);
 assert.equal(recommend('BTN',7,'CO','response'),null);
 assert.equal(recommend('BTN',15,'CO','facingJam'),null);
});
test('7BB and 8–10BB bands and positions materially change AOF boundaries',()=>{
 assert.equal(recommend('UTG',7,'','open')!.decisions['55'].move,'jam');
 assert.equal(recommend('UTG',10,'','open')!.decisions['55'].move,'fold');
 assert.equal(recommend('BTN',7,'CO','facingJam')!.decisions['A2o'].move,'fold');
 assert.equal(recommend('BTN',7,'','open')!.decisions['A7o'].move,'jam');
 assert.equal(recommend('BB',7,'SB','facingJam')!.decisions['ATo'].move,'callJam');
 assert.ok(coverage(recommend('UTG+1',7,'UTG','facingJam')!,'callJam')<coverage(recommend('BB',7,'UTG','facingJam')!,'callJam'));
});

test('conservative openings exclude UTG and UTG+1 ATo at every depth and enforce the new 15BB UTG boundary',()=>{
 for(const d of depths)for(const p of ['UTG','UTG+1'])assert.equal(recommend(p,d,'','open')!.decisions.ATo.move,'fold');
 const r=recommend('UTG',15,'','open')!;
 const expected=expand('77+ AJs+ KQs AQo+');
 assert.deepEqual(new Set(allHands.filter(h=>r.decisions[h].move!=='fold')),expected);
 assert.equal(r.decisions.AJo.move,'fold');assert.equal(r.decisions.ATs.move,'fold');assert.equal(r.decisions['66'].move,'fold');
 assert.ok(r.decisions.ATo.reason.includes('지배'));
});
