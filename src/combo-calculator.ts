import {allHands,ranks} from './ranges.ts';
import {recommend,type Move,type Recommendation} from './recommendations.ts';
export const suitCodes=['s','h','d','c'];
export const suitSymbols:Record<string,string>={s:'♠',h:'♥',d:'♦',c:'♣'};
export const cards=suitCodes.flatMap(s=>ranks.map(r=>r+s));
export const cardLabel=(c:string)=>c[0]+suitSymbols[c[1]];
export type CardCombo=[string,string];
export function handCombos(hand:string):CardCombo[]{
 if(!allHands.includes(hand))throw new Error('Invalid hand class');
 const result:CardCombo[]=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++){
  if(hand.length===2&&a>=b)continue;
  if(hand.endsWith('s')&&a!==b)continue;
  if(hand.endsWith('o')&&a===b)continue;
  result.push([hand[0]+suitCodes[a],hand[1]+suitCodes[b]]);
 }return result;
}
export const comboLookup=Object.fromEntries(allHands.map(h=>[h,handCombos(h)]));
export function calculateCombos(range:Iterable<string>,targets:Iterable<string>,blockers:Iterable<string>){
 const blocked=new Set(blockers);if([...blocked].some(c=>!cards.includes(c)))throw Error('Invalid blocker');
 const selected=new Set(range),target=new Set(targets);if([...selected,...target].some(h=>!allHands.includes(h)))throw Error('Invalid hand class');
 const rows=[...selected].map(h=>{const before=comboLookup[h];const available=before.filter(c=>!c.some(x=>blocked.has(x)));return {hand:h,before:before.length,remaining:available.length,removed:before.length-available.length,combos:available,target:target.has(h)}});
 const before=rows.reduce((n,r)=>n+r.before,0),remaining=rows.reduce((n,r)=>n+r.remaining,0);
 const targetBefore=rows.filter(r=>r.target).reduce((n,r)=>n+r.before,0),targetRemaining=rows.filter(r=>r.target).reduce((n,r)=>n+r.remaining,0);
 const unknown=52-blocked.size,allAvailable=unknown*(unknown-1)/2;
 return {rows,before,remaining,removed:before-remaining,targetBefore,targetRemaining,targetRemoved:targetBefore-targetRemaining,allAvailable,blockerCount:blocked.size,rangePercent:allAvailable?remaining/allAvailable*100:null,targetPercent:remaining?targetRemaining/remaining*100:null,targetDeckPercent:allAvailable?targetRemaining/allAvailable*100:null};
}
export type ObservedAction='open'|'call'|'three'|'openJam'|'reshove'|'callJam';
export const observedLabels:Record<ObservedAction,string>={open:'오픈 레이즈',call:'플랫콜',three:'일반 3벳',openJam:'선제 올인',reshove:'오픈에 리쇼브',callJam:'상대 올인에 콜'};
export function inferOpponent(position:string,depth:number,opener:string,action:ObservedAction):{range:Set<string>;model:Recommendation|null;error:string|null}{
 const scenario=action==='open'||action==='openJam'?'open':action==='callJam'?'facingJam':'response';
 const wanted:Move=action==='openJam'||action==='reshove'?'jam':action;
 const model=recommend(position,depth,opener,scenario);
 if(!model)return {range:new Set(),model:null,error:'선택한 깊이·포지션·액션을 현재 모델에서 지원하지 않습니다. 10BB 이하는 선제 올인/올인 콜을 선택하세요.'};
 const range=new Set(allHands.filter(h=>model.decisions[h].move===wanted));
 return {range,model,error:range.size?null:'이 상황의 보수적 모델에는 해당 액션의 핸드가 없습니다. 다른 액션을 선택하거나 직접 범위를 수정하세요.'};
}
