import {test} from 'node:test';
import assert from 'node:assert/strict';
import pdf from '../src/reference-data.json' with {type:'json'};
import book from '../src/book-data.json' with {type:'json'};
import {allHands,combos} from '../src/ranges.ts';
import {lookupReference,weightedFrequency,missingReason} from '../src/reference-ranges.ts';
test('70 PDF charts have complete, normalized nonnegative action probabilities',()=>{
 assert.equal(pdf.length,70);assert.equal(new Set(pdf.map(c=>`${c.position}-${c.opener}-${c.stack}-${c.scenario}`)).size,70);
 for(const chart of pdf){assert.equal(Object.keys(chart.frequencies).length,169);for(const h of allHands){const f=chart.frequencies[h as keyof typeof chart.frequencies];assert.ok(f);assert.ok([f.raise,f.call,f.fold].every(n=>n>=0&&n<=1));assert.ok(Math.abs(f.raise+f.call+f.fold-1)<1e-8)}}
});
// Independent transcription of the source chart header totals, in page/grid order.
const headerTotals=[
 [11.38,0],[13.22,0],[15.69,0],[19.60,0],[26.14,0],[40.28,0],[9.84,64.12],
 [11.36,0],[13.28,0],[15.96,0],[20.25,0],[27.57,0],[44.43,0],[12.70,55.58],
 [3.53,3.82],[3.74,4.17],[3.89,4.69],[3.94,5.71],[4.16,7.23],[4.00,2.79],
 [3.65,11.37],[4.32,4.07],[4.41,5.09],[4.58,6.06],[4.80,7.29],[4.59,3.15],
 [4.31,12.51],[5.20,4.90],[5.35,5.98],[5.57,7.75],[5.41,4.05],[5.26,14.39],
 [6.34,5.99],[6.63,8.92],[6.82,3.26],[6.75,16.48],[8.58,9.71],[8.84,3.57],
 [8.76,19.60],[12.49,4.51],[12.75,25.49],[10.49,35.66],
 [4.22,2.97],[4.39,3.28],[4.56,3.90],[4.62,5.06],[4.63,6.56],[2.87,4.42],
 [2.76,12.06],[4.97,3.20],[5.19,4.10],[5.53,4.90],[6.04,5.99],[3.25,5.05],
 [3.18,13.31],[6.36,3.79],[6.94,4.31],[7.21,6.45],[3.60,6.25],[3.55,15.69],
 [8.45,4.22],[8.65,7.86],[4.55,6.65],[4.45,19.04],[11.21,8.15],[7.39,4.70],
 [6.94,23.09],[10.76,6.73],[11.33,31.07],[11.85,33.92]
];
test('image recovery stays within 0.25 percentage points of all 140 source header totals',()=>{
 assert.equal(headerTotals.length,pdf.length);
 for(const [i,c] of pdf.entries())for(const [j,a] of ['raise','call'].entries()){
  const actual=allHands.reduce((n,h)=>n+combos(h)*c.frequencies[h as keyof typeof c.frequencies][a as 'raise'|'call'],0)/1326*100;
  assert.ok(Math.abs(actual-headerTotals[i][j])<.25,`${c.id} ${a}: ${actual} vs ${headerTotals[i][j]}`);
 }
});
test('eight book charts match every source combination total exactly',()=>{assert.equal(book.length,8);for(const c of book){assert.equal(new Set(c.hands).size,c.hands.length);assert.equal(c.hands.reduce((n,h)=>n+combos(h),0),c.combos)}});
test('source profiles never invent missing tournament, position, stack or book response data',()=>{assert.equal(lookupReference('tournament','BTN',40,'CO','open'),null);assert.equal(lookupReference('pdf','UTG+2',100,'UTG','open'),null);assert.equal(lookupReference('pdf','BTN',40,'CO','open'),null);assert.equal(lookupReference('book','BTN',30,'CO','call'),null);assert.equal(lookupReference('book','BTN',11,'CO','open'),null);assert.equal(lookupReference('book','BTN',101,'CO','open'),null);assert.equal(lookupReference('pdf','BTN',NaN,'CO','open'),null);});
test('book 40BB boundary and source lookups resolve independently',()=>{assert.equal(lookupReference('book','EP',39,'','open')?.id,'book-d3');assert.equal(lookupReference('book','EP',40,'','open')?.id,'book-d1');const r=lookupReference('pdf','BTN',100,'CO','three')!;assert.equal(r.id,'pdf-11-4');assert.ok(weightedFrequency(r,'three')>0);assert.equal(r.raiseSize,10);assert.ok(missingReason('pdf','BTN',40,'open').includes('보간하지'));});
