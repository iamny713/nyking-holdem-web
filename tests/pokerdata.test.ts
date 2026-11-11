import test from 'node:test';
import assert from 'node:assert/strict';
import {historyFor,choices,parseNode,handStrategy} from '../src/pokerdata.ts';
test('preflop history preserves the full sequence and changes raise choices',()=>{
 assert.equal(historyFor('LJ',['Fold','Open']),'UTG_Fold_UTG1_Open_LJ');
 assert.deepEqual(choices(['Open']),['Fold','Call','3B','AI']);
 assert.deepEqual(choices(['AI']),['Fold','Call']);
 assert.throws(()=>historyFor('BB',Array(7).fill('Fold')));
 assert.throws(()=>historyFor('LJ',['Open','Open']));
});
test('response matching, missing EVs, and incomplete hand weights are explicit',()=>{
 const n=parseNode({game:'nlmtt8',stack:40,history:'UTG',actor:'UTG',evUnit:'sb',evBaseline:'fold',actions:[{action:'Fold',kind:'fold',weights:{AA:0},evs:{AA:0}},{action:'Open',kind:'raise',sizeBb:2.19,weights:{AA:1}}]},40,'UTG');
 assert.equal(handStrategy(n,'AA').valid,true);
 assert.equal(handStrategy(n,'AA').rows[1].ev,null);
 assert.equal(handStrategy(n,'72o').valid,false);
 assert.throws(()=>parseNode(n,100,'UTG'));
 assert.throws(()=>parseNode({...n,actions:[{action:'Open',kind:'raise',weights:{AA:100}}]},40,'UTG'));
});

import {parseSpots,nextSteps,pathDecisions,dominantStrategy} from '../src/pokerdata.ts';
test('catalog navigation preserves exact action tokens and repeat actors',()=>{
 const list=parseSpots({spots:[{history:'UTG'},{history:'UTG_Open-40034_UTG1'},{history:'UTG_Open-40034_UTG1_3B_BTN'},{history:'UTG_Open-40034_UTG1_3B_BTN_Fold_UTG'}]});
 assert.deepEqual(nextSteps(list,'UTG'),[{action:'Open-40034',next:'UTG_Open-40034_UTG1'}]);
 assert.equal(nextSteps(list,'UTG_Open-40034_UTG1_3B_BTN')[0].next,'UTG_Open-40034_UTG1_3B_BTN_Fold_UTG');
 assert.deepEqual(pathDecisions('UTG_Fold_UTG1_Open_LJ').map(x=>x.action),['Fold','Open']);
 assert.throws(()=>parseSpots({message:'unsupported'}));
});
test('simplification retains mixed strategies and refuses invalid frequencies',()=>{
 const node={game:'nlmtt8',stack:40,history:'UTG',actor:'UTG',evUnit:'sb',evBaseline:'fold',actions:[{action:'Call',kind:'call',weights:{A5s:.7}},{action:'3B',kind:'raise',weights:{A5s:.3}}]};
 assert.equal(dominantStrategy(node,'A5s')!.mixed,true);
 assert.equal(dominantStrategy(node,'A5s')!.main.action,'Call');
 assert.equal(dominantStrategy(node,'72o'),null);
});
