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

test('single-hand node frequencies normalize without inventing other hands',()=>{
 const node=parseNode({game:'nlmtt8',stack:40,history:'UTG',actor:'UTG',evUnit:'sb',evBaseline:'fold',actions:[{action:'Fold',kind:'fold',freq:.3,ev:0},{action:'Open',kind:'raise',freq:.7,ev:1.2}]},40,'UTG','A5s');
 assert.equal(handStrategy(node,'A5s').valid,true);
 assert.equal(handStrategy(node,'A5s').rows[1].ev,1.2);
 assert.equal(handStrategy(node,'AA').valid,false);
});

import {localSteps} from '../src/pokerdata.ts';
import {cardHand} from '../src/solver-cards.ts';
test('offline action builder skips folded seats and returns to the opener',()=>{
 assert.equal(localSteps('UTG').find(x=>x.action==='Open')!.next,'UTG_Open_UTG1');
 const h='UTG_Open_UTG1_Fold_LJ_Fold_HJ_Fold_CO_Fold_BTN_3B_SB_Fold_BB';
 assert.equal(localSteps(h).find(x=>x.action==='Fold')!.next,h+'_Fold_UTG');
 assert.equal(localSteps(h+'_Fold_UTG').some(x=>x.action==='4B'),true);
 assert.equal(localSteps('UTG_AI_UTG1').some(x=>x.action==='3B'),false);
});
test('two selected cards map to solver classes and reject duplicates',()=>{
 assert.equal(cardHand(['Ks','As']),'AKs');assert.equal(cardHand(['Kh','As']),'AKo');assert.equal(cardHand(['Ah','As']),'AA');
 assert.equal(cardHand(['As','As']),null);assert.equal(cardHand([null,'Ks']),null);
});

import {readUsage} from '../src/pokerdata.ts';
test('usage reads actual account headers and never invents absent values',()=>{
 assert.equal(readUsage(new Headers()),null);
 const u=readUsage(new Headers({'X-Usage-Requests-Used':'0','X-Usage-Requests-Limit':'10000','X-Usage-Bytes-Used':'2500000','X-Usage-Bytes-Limit':'200000000','X-Usage-Resets-At':'2026-12-01T00:00:00Z'}))!;
 assert.equal(u.requestsUsed,0);assert.equal(u.bytesUsed,2500000);assert.equal(u.bytesLimit,200000000);
 const partial=readUsage(new Headers({'X-Usage-Requests-Used':'7','X-Usage-Bytes-Limit':'oops'}))!;
 assert.equal(partial.requestsLimit,null);assert.equal(partial.bytesLimit,null);
});
