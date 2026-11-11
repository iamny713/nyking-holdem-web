import {allHands,combos,positions,ranks} from './ranges.ts';
export const depths = [1,2,3,4,5,6,7,8,9,10,15,20,25,30,40,60,80,100] as const;
export type Scenario = 'open'|'response'|'facingJam';
export type Move = 'open'|'call'|'three'|'jam'|'callJam'|'fold';
export const moveLabels:Record<Move,string> = {open:'오픈',call:'플랫콜',three:'일반 3벳',jam:'올인',callJam:'올인 콜',fold:'폴드'};
export const moveColors:Record<Move,string> = {open:'#b8ed84',call:'#88b9d7',three:'#e8c185',jam:'#d99bcb',callJam:'#b3a7f5',fold:'#28372d'};
export const model = {version:'1.2.0',players:9,ante:'BB 앤티 1 BB',model:'chipEV',stacks:'전원 동일 스택',solverVerified:false};
// These are authored strategic choices, NOT solver outputs, trained weights, or source-chart interpolations.
// Each row explicitly selects one complete opening repertoire for its stack depth.
const openingSpecs:Record<number,string[]> = {
 15:[
 '77+ AJs+ KQs AQo+',
 '66+ ATs+ KQs AJo+',
 '66+ ATs+ KJs+ QJs AJo+ KQo',
 '55+ A9s+ KTs+ QTs+ JTs ATo+ KQo',
 '44+ A5s+ KTs+ QTs+ JTs A9o+ KJo+',
 '33+ A2s+ K9s+ QTs+ JTs T9s A8o+ KTo+ QJo',
 '22+ A2s+ K7s+ Q9s+ J9s+ T9s 98s A5o+ KTo+ QTo+ JTo',
 '22+ A2s+ K5s+ Q8s+ J8s+ T8s+ 98s 87s A2o+ K9o+ QTo+ JTo'],
 20:[
 '55+ A9s+ A5s-A4s KJs+ QJs JTs AJo+ KQo',
 '55+ A8s+ A5s-A4s KTs+ QTs+ JTs ATo+ KQo',
 '44+ A7s+ A5s-A4s KTs+ QTs+ JTs T9s ATo+ KQo',
 '44+ A2s+ K9s+ QTs+ JTs T9s A9o+ KJo+',
 '33+ A2s+ K9s+ Q9s+ J9s+ T9s 98s A8o+ KTo+ QJo',
 '22+ A2s+ K7s+ Q8s+ J8s+ T8s+ 98s 87s A5o+ KTo+ QTo+ JTo',
 '22+ A2s+ K3s+ Q6s+ J7s+ T7s+ 97s+ 87s 76s A2o+ K8o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q4s+ J6s+ T7s+ 97s+ 86s+ 76s A2o+ K7o+ Q8o+ J9o+ T9o'],
 25:[
 '55+ A8s+ A5s-A4s KTs+ QTs+ JTs AJo+ KQo',
 '44+ A7s+ A5s-A4s KTs+ QTs+ JTs T9s ATo+ KQo',
 '44+ A5s+ KTs+ QTs+ JTs T9s ATo+ KJo+',
 '33+ A2s+ K9s+ Q9s+ JTs T9s 98s A9o+ KJo+ QJo',
 '22+ A2s+ K8s+ Q9s+ J9s+ T9s 98s 87s A8o+ KTo+ QTo+',
 '22+ A2s+ K6s+ Q8s+ J8s+ T8s+ 97s+ 87s 76s A5o+ KTo+ QTo+ JTo',
 '22+ A2s+ K2s+ Q5s+ J7s+ T7s+ 97s+ 86s+ 76s 65s A2o+ K8o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q3s+ J5s+ T6s+ 96s+ 86s+ 75s+ 65s A2o+ K7o+ Q8o+ J8o+ T9o'],
 30:[
 '44+ A7s+ A5s-A4s KTs+ QTs+ JTs T9s AJo+ KQo',
 '44+ A5s+ KTs+ QTs+ JTs T9s ATo+ KQo',
 '33+ A2s+ K9s+ QTs+ JTs T9s 98s ATo+ KJo+',
 '33+ A2s+ K9s+ Q9s+ J9s+ T9s 98s A9o+ KJo+ QJo',
 '22+ A2s+ K8s+ Q9s+ J9s+ T8s+ 98s 87s A8o+ KTo+ QTo+',
 '22+ A2s+ K5s+ Q8s+ J8s+ T8s+ 97s+ 86s+ 76s 65s A5o+ K9o+ QTo+ JTo',
 '22+ A2s+ K2s+ Q5s+ J7s+ T7s+ 97s+ 86s+ 75s+ 65s 54s A2o+ K8o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q3s+ J5s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K7o+ Q8o+ J8o+ T8o+'],
 40:[
 '33+ A5s+ KTs+ QTs+ JTs T9s 98s AJo+ KQo',
 '33+ A2s+ KTs+ QTs+ JTs T9s 98s ATo+ KQo',
 '22+ A2s+ K9s+ QTs+ J9s+ T9s 98s 87s ATo+ KJo+',
 '22+ A2s+ K9s+ Q9s+ J9s+ T9s 98s 87s A9o+ KJo+ QJo',
 '22+ A2s+ K7s+ Q8s+ J9s+ T8s+ 98s 87s 76s A8o+ KTo+ QTo+',
 '22+ A2s+ K4s+ Q7s+ J7s+ T7s+ 97s+ 86s+ 76s 65s 54s A5o+ K9o+ QTo+ JTo',
 '22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K7o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q3s+ J5s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K7o+ Q8o+ J8o+ T8o+'],
 60:[
 '22+ A2s+ KTs+ QTs+ JTs T9s 98s AJo+ KQo',
 '22+ A2s+ KTs+ QTs+ JTs T9s 98s 87s ATo+ KQo',
 '22+ A2s+ K9s+ QTs+ J9s+ T9s 98s 87s 76s ATo+ KJo+',
 '22+ A2s+ K9s+ Q9s+ J9s+ T8s+ 98s 87s 76s A9o+ KJo+ QJo',
 '22+ A2s+ K7s+ Q8s+ J8s+ T8s+ 97s+ 87s 76s 65s A8o+ KTo+ QTo+',
 '22+ A2s+ K4s+ Q7s+ J7s+ T7s+ 97s+ 86s+ 75s+ 65s 54s A5o+ K9o+ QTo+ JTo',
 '22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 74s+ 64s+ 54s A2o+ K7o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q3s+ J5s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K8o+ Q9o+ J9o+ T9o'],
 80:[
 '22+ A2s+ KTs+ QTs+ JTs T9s 98s 87s AJo+ KQo',
 '22+ A2s+ KTs+ QTs+ JTs T9s 98s 87s 76s ATo+ KQo',
 '22+ A2s+ K9s+ QTs+ J9s+ T9s 98s 87s 76s ATo+ KJo+',
 '22+ A2s+ K9s+ Q9s+ J9s+ T8s+ 98s 87s 76s 65s A9o+ KJo+ QJo',
 '22+ A2s+ K7s+ Q8s+ J8s+ T8s+ 97s+ 87s 76s 65s 54s A8o+ KTo+ QTo+',
 '22+ A2s+ K4s+ Q7s+ J7s+ T7s+ 97s+ 86s+ 75s+ 64s+ 54s A5o+ K9o+ QTo+ JTo',
 '22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 74s+ 64s+ 54s A2o+ K8o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K8o+ Q9o+ J9o+ T9o'],
 100:[
 '22+ A2s+ KTs+ QTs+ JTs T9s 98s 87s AJo+ KQo',
 '22+ A2s+ KTs+ QTs+ JTs T9s 98s 87s 76s ATo+ KQo',
 '22+ A2s+ K9s+ QTs+ J9s+ T9s 98s 87s 76s ATo+ KJo+',
 '22+ A2s+ K9s+ Q9s+ J9s+ T8s+ 98s 87s 76s 65s A9o+ KJo+ QJo',
 '22+ A2s+ K7s+ Q8s+ J8s+ T8s+ 97s+ 87s 76s 65s 54s A8o+ KTo+ QTo+',
 '22+ A2s+ K4s+ Q7s+ J7s+ T7s+ 97s+ 86s+ 75s+ 64s+ 54s A5o+ K9o+ QTo+ JTo',
 '22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 74s+ 64s+ 54s A2o+ K8o+ Q9o+ J9o+ T9o',
 '22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K8o+ Q9o+ J9o+ T9o']
};
const value=(r:string)=>14-ranks.indexOf(r);
const specCache = new Map<string,Set<string>>();
export function expand(spec:string):Set<string>{
 const cached=specCache.get(spec);if(cached)return cached;
 const out=new Set<string>();
 for(const token of spec.split(/\s+/).filter(Boolean)){
  const exact=token.replace('+','');
  if(token.includes('-')){const [a,b]=token.split('-');if(a[0]!==b[0]||a[2]!==b[2])throw Error(`Unsupported interval ${token}`);for(const h of allHands)if(h[0]===a[0]&&h[2]===a[2]&&value(h[1])<=value(a[1])&&value(h[1])>=value(b[1]))out.add(h)}
  else if(token.endsWith('+')){for(const h of allHands){if(exact.length===2){if(h.length===2&&value(h[0])>=value(exact[0]))out.add(h)}else if(h[0]===exact[0]&&h[2]===exact[2]&&value(h[1])>=value(exact[1]))out.add(h)}}
  else{if(!allHands.includes(token))throw Error(`Invalid hand ${token}`);out.add(token)}
 }specCache.set(spec,out);return out;
}
const opens=Object.fromEntries(Object.entries(openingSpecs).map(([depth,specs])=>[depth,specs.map(expand)]));
export type Decision = {move:Move;reason:string;principles:string[]};
export type Recommendation = {position:string;opener:string;depth:number;scenario:Scenario;decisions:Record<string,Decision>;sizes:{open:number;three:number|null};version:string};
const has=(h:string,spec:string)=>expand(spec).has(h);
export function recommend(position:string,depth:number,opener:string,scenario:Scenario):Recommendation|null{
 const p=positions.indexOf(position),o=positions.indexOf(opener);
 if(depth<=10||scenario==='facingJam')return shortRecommendation(position,depth,opener,scenario);
 if(!depths.some(d=>d===depth)||p<0||(scenario==='open'?p===8:o<0||o>=p))return null;
 const standardOpenSize=depth<=25?2:depth<=60?2.2:2.3;
 const openSize=(scenario==='response'?opener:position)==='SB'?Math.min(3,standardOpenSize+.5):standardOpenSize;
 const threeSize=depth<=20?null:depth<=30?(p>=7?6.5:5.5):depth<=60?(p>=7?8:6.6):(p>=7?9.2:7.4);
 const decisions:Record<string,Decision>={};
 for(const h of allHands){
  const a=value(h[0]),b=value(h[1]),pair=h.length===2,suited=h.endsWith('s'),connector=suited&&a-b===1,wheel=suited&&a===14&&b<=5;
  const family=pair?'페어':wheel?'휠 수딧 에이스':suited&&a===14?'수딧 에이스':connector?'수딧 커넥터':a>=11&&b>=10?'브로드웨이':suited?'수딧 핸드':'오프수트 핸드';
  const principles=['position',depth<=25?'short-stack':'implied-odds'];
  let move:Move='fold',reason='';
  if(scenario==='open'){
   const included=opens[depth][p].has(h);
   if(included){move='open';
    // Deliberately simplified pure-action repertoire. Premiums retain small raises.
    if(depth===15&&p>=4&&(pair&&a<=8||!suited&&a===14&&b<=9||p===7&&has(h,'KTo QTo JTo')))move='jam';
    if(depth===20&&p>=6&&(pair&&a<=5||!suited&&a===14&&b<=5))move='jam';
    reason=move==='jam'?'짧은 스택에서 작은 페어나 약한 오프수트 A의 포스트플랍 부담을 줄이고, 앤티가 있는 팟을 즉시 획득하는 쪽으로 설계했습니다.':pair?(depth<=25?'이 깊이에서 유지할 페어를 선별했습니다. 셋 적중만을 전제로 범위를 넓히지 않습니다.':'페어의 기본 쇼다운 가치와 강한 족보로 개선될 가능성을 고려해 포함했습니다.'):suited?(depth<=25?'짧은 스택에서도 유지할 수딧 고카드와 연결성을 선별했습니다. 깊은 스택 차트의 약한 수딧 핸드를 모두 가져오지 않습니다.':'수딧의 넛 잠재력·연결성과 포지션을 고려해 포함했습니다. 낮은 연결성만으로 모든 수딧을 포함하지 않습니다.'):'앤티와 남은 플레이어 수를 고려해 이 포지션에서 유지할 고카드를 선별했습니다. 약한 탑페어의 지배 위험도 고려했습니다.';
   }else reason=p<=3?'뒤에 남은 플레이어가 많아 지배당하기 쉬운 핸드와 실현성이 낮은 핸드를 제외했습니다.':depth<=25?'짧은 스택에서 필요한 고카드 가치·즉시 폴드 유도·포스트플랍 실현성이 부족하다고 판단해 제외했습니다.':'이 단순화된 오픈 범위에서는 킥커·연결성·플러시 잠재력이 부족한 쪽을 제외했습니다.';
   if(p===7){principles.push('small-blind');reason+=' SB는 림프를 생략한 레이즈/올인/폴드 기준입니다. 완전한 SB 균형 전략은 아닙니다.'}
  }else{
   const late=o>=5,middle=o>=3&&o<5,bb=p===8,sb=p===7,inPosition=p<7;
   principles.push('opener-strength',bb?'blind-price':sb?'small-blind':'position-realization');
   if(depth<=20){
    const core=late?'77+ ATs+ AJo+ KQs':middle?'88+ AJs+ AQo+':'TT+ AQs+ AKo';
    const extension=late&&(bb||sb)?'55+ A8s+ ATo+ KJs+ KQo':middle&&bb?'99 AJs KQs':'';
    if(has(h,core)||has(h,extension)){move='jam';reason='짧은 스택에서는 작은 3벳 뒤에 남는 스택이 작습니다. 상대 오픈 위치에 맞춰 고카드·페어 중심의 3벳 올인으로 단순화했습니다.'}
    else if(bb&&(pair&&a>=3||suited&&(a===14||a>=11&&b>=8||connector&&a>=7)||!suited&&(a===14&&b>=(late?6:10)||a>=12&&b>=10))){move='call';reason='BB는 추가로 지불하는 금액이 작고 액션을 닫을 수 있어 콜 범위를 유지했습니다. 일반 오픈에 대한 방어이며 올인 콜 범위가 아닙니다.'}
    else if(!sb&&inPosition&&has(h,late?'66 55 A9s A8s KJs KTs QJs JTs':middle?'77 66 ATs KQs QJs':'99 88 AJs KQs')){move='call';reason='앞선 오픈에 바로 올인하기보다 포지션에서 유지할 중간 페어·수딧 브로드웨이를 제한적으로 남겼습니다. 뒤 플레이어의 스퀴즈 가능성은 남아 있습니다.'}
   }else{
    const core=late?'TT+ AQs+ AKo':middle?'JJ+ AKs AKo':'QQ+ AKs AKo';
    // Mid-stack re-shoves move vulnerable strong hands in, while the premium core still induces with small 3-bets.
    if(depth<=30&&((late&&has(h,depth===25?'66 77 88 99 ATs AJs AQo':'88 99 AJs AQo'))||(middle&&depth===25&&has(h,'99 TT AQs')))){
     move='jam';reason='중간 스택에서 작은 3벳 후 결정을 어렵게 만드는 페어·강한 고카드를 올인 쪽으로 배치했습니다. 상대가 뒤 포지션에서 오픈할수록 넓게 적용한 설계입니다.';
    }else if(has(h,core)||(late&&bb&&has(h,'99 AJs AQo KQs'))){move='three';reason='강한 페어·고카드를 일반 3벳의 중심으로 두었습니다. 짧은 구간에서 일부 핸드를 올인으로 보내더라도 이 강한 중심은 유지합니다.'}
    else if(depth>=40&&wheel&&b>=4&&(o>=3||depth>=60)&&(!sb||late)||depth>=60&&late&&suited&&has(h,'K9s Q9s')){
     move='three';reason=wheel?'A 블로커와 수딧의 넛 잠재력을 가진 일부 휠 에이스를 3벳 후보로 배치했습니다. 블로커만으로 +EV를 검증한 것은 아닙니다.':'상대의 넓은 오픈에 대응할 수딧 고카드를 제한된 3벳 후보로 포함했습니다. 모든 수딧 커넥터를 블러프로 쓰지는 않습니다.';principles.push('blockers');
    }else if(sb){
     // Simplified SB avoids cold-calls and the unmodeled squeeze/multiway branch.
     if(late&&depth>=40&&has(h,'88 99 ATs AJs KQs AQo')){move='three';reason='SB의 포지션 불리함과 BB의 추가 참여를 고려해, 늦은 오픈에 강한 중간 핸드를 3벳으로 단순화했습니다.'}
    }else if(pair&&a>=(bb?2:depth>=40?2:5)){
     move='call';reason=depth>=40?'강한 페어를 3벳으로 분리한 뒤, 남은 페어는 스택 여유와 포지션·BB의 가격을 고려해 콜로 배치했습니다. 셋마이닝의 수익을 보장하지 않습니다.':'작은 페어의 임플라이드 오즈를 제한하고 남은 중간 페어를 콜 범위로 유지했습니다.';
    }else if(suited&&(a===14&&b>=(bb?2:late?2:middle?5:10)||a===13&&b>=(bb?late?5:8:late?9:11)||a===12&&b>=(bb?late?7:9:late?9:11)||a===11&&b>=(bb?8:late?9:10)||connector&&a>=(bb?6:depth>=40&&late?6:9)||bb&&late&&a>=8&&a-b<=2)){
     move='call';reason=bb?'BB의 가격과 액션 종료를 고려해 수딧 고카드·연결성 핸드를 콜 방어에 포함했습니다. 상대의 큰 오픈이나 올인에는 이 범위를 쓰지 않습니다.':'강한 핸드·일부 블로커 핸드를 3벳으로 분리하고, 포지션에서 실현성이 있는 수딧 핸드를 콜로 남겼습니다.';
    }else if(!suited&&!pair&&(bb&&(a===14&&b>=(late?2:middle?8:10)||a===13&&b>=(late?8:11)||a===12&&b>=(late?9:11)||late&&a>=10&&b>=9)||inPosition&&has(h,late?'AJo AQo KQo':middle?'AQo KQo':'AQo'))){move='call';reason='BB의 추가 비용 또는 포지션을 고려해 일부 오프수트 고카드를 남겼습니다. 약한 킥커의 지배 위험 때문에 모든 고카드를 콜하지 않습니다.'}
   }
   if(move==='fold')reason=sb?'SB는 포지션이 불리하고 BB가 남아 있어, 이번 추천에서는 플랫콜을 생략하고 3벳/올인/폴드로 단순화했습니다.':o<=2?'앞 포지션의 강한 오픈 범위를 상대로 지배 위험과 뒤 플레이어의 재공격을 고려해 제외했습니다.':'상대의 오픈 범위, 스택과 포지션을 함께 고려했을 때 이 기본 방어 범위에는 넣지 않았습니다.';
  }
  decisions[h]=tighten(h,{move,reason:`${family} · ${reason}`,principles},p,o,depth,scenario);
 }
 return {position,opener,depth,scenario,decisions,sizes:{open:openSize,three:threeSize},version:model.version};
}
export function coverage(r:Recommendation,move:Move){return allHands.reduce((sum,h)=>sum+(r.decisions[h].move===move?combos(h):0),0)/1326}

// Short-stack AOF repertoires are independently authored. No Nash or positive-EV claim.
// Same repertoire within 1–4 / 5–7 / 8–10BB bands; actual depth still determines the total wager.
const shortOpenSpecs:Record<number,string[]>={
 10:[
 '44+ A7s+ ATo+ KJs+ QJs',
 '33+ A5s+ A9o+ KTs+ QTs+ JTs',
 '22+ A2s+ A8o+ KTs+ QTs+ JTs T9s',
 '22+ A2s+ A7o+ K9s+ KJo+ QTs+ QJo JTs T9s 98s',
 '22+ A2s+ A5o+ K8s+ KTo+ Q9s+ QTo+ J9s+ JTo T9s 98s',
 '22+ A2s+ A2o+ K5s+ K9o+ Q8s+ QTo+ J8s+ JTo T8s+ 98s 87s',
 '22+ A2s+ A2o+ K2s+ K5o+ Q5s+ Q8o+ J7s+ J9o+ T7s+ T9o 97s+ 87s 76s',
 '22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q5o+ J4s+ J7o+ T5s+ T8o+ 95s+ 98o 85s+ 75s+ 65s 54s'],
 7:[
 '22+ A2s+ A8o+ KTs+ KQo QTs+ JTs T9s',
 '22+ A2s+ A7o+ K9s+ KJo+ QTs+ QJo JTs T9s',
 '22+ A2s+ A5o+ K8s+ KTo+ Q9s+ QTo+ J9s+ JTo T9s 98s',
 '22+ A2s+ A2o+ K7s+ K9o+ Q8s+ QTo+ J8s+ JTo T8s+ 98s 87s',
 '22+ A2s+ A2o+ K5s+ K8o+ Q7s+ Q9o+ J8s+ JTo T8s+ 97s+ 87s 76s',
 '22+ A2s+ A2o+ K2s+ K5o+ Q5s+ Q8o+ J7s+ J9o+ T7s+ T9o 97s+ 86s+ 76s 65s',
 '22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q5o+ J4s+ J7o+ T5s+ T8o+ 95s+ 98o 85s+ 75s+ 65s 54s',
 '22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q2o+ J2s+ J4o+ T2s+ T6o+ 94s+ 97o+ 84s+ 87o 74s+ 76o 64s+ 54s'],
 4:[
 '22+ A2s+ A2o+ K6s+ K9o+ Q8s+ QTo+ J8s+ JTo T8s+ 98s 87s',
 '22+ A2s+ A2o+ K5s+ K8o+ Q7s+ Q9o+ J8s+ JTo T8s+ 97s+ 87s 76s',
 '22+ A2s+ A2o+ K3s+ K7o+ Q6s+ Q9o+ J7s+ J9o+ T7s+ T9o 97s+ 86s+ 76s 65s',
 '22+ A2s+ A2o+ K2s+ K5o+ Q5s+ Q8o+ J7s+ J9o+ T7s+ T9o 97s+ 86s+ 75s+ 65s 54s',
 '22+ A2s+ A2o+ K2s+ K3o+ Q3s+ Q7o+ J5s+ J8o+ T6s+ T8o+ 96s+ 98o 85s+ 75s+ 64s+ 54s',
 '22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q4o+ J3s+ J6o+ T4s+ T7o+ 94s+ 97o+ 84s+ 87o 74s+ 76o 64s+ 54s',
 '22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q2o+ J2s+ J3o+ T2s+ T5o+ 92s+ 96o+ 83s+ 86o+ 73s+ 75o+ 63s+ 65o 53s+ 43s',
 '22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q2o+ J2s+ J2o+ T2s+ T3o+ 92s+ 94o+ 82s+ 85o+ 72s+ 75o+ 62s+ 64o+ 52s+ 54o 42s+ 32s']
};
export function shortBand(depth:number){return depth<=4?4:depth<=7?7:10}
function shortRecommendation(position:string,depth:number,opener:string,scenario:Scenario):Recommendation|null{
 const p=positions.indexOf(position),o=positions.indexOf(opener);
 if(!Number.isInteger(depth)||depth<1||depth>10||p<0||scenario==='response'||(scenario==='open'?p===8:o<0||o>=p))return null;
 const band=shortBand(depth),late=o>=5,middle=o>=3;
 const pushRange=expand(shortOpenSpecs[band][p===8?7:p]);
 let callSpec=band===10?(late?'55+ A5s+ A9o+ KJs+ QJs KQo':middle?'77+ ATs+ AJo+ KQs':'88+ AJs+ AQo+ KQs'):band===7?(late?'44+ A2s+ A8o+ KTs+ QTs+ JTs KJo+ QJo':middle?'66+ A8s+ ATo+ KJs+ QJs KQo':'77+ ATs+ AJo+ KQs'):(late?'22+ A2s+ A2o+ K8s+ KTo+ Q9s+ QTo+ JTs':middle?'44+ A2s+ A8o+ KTs+ QTs+ KJo+':'55+ A7s+ ATo+ KJs+ QJs KQo');
 if(p<=3)callSpec=band===10?'99+ AQs+ AKo':band===7?'88+ ATs+ AQo+ KQs':'66+ A9s+ AJo+ KQs';
 if(p===7&&late)callSpec=band===10?'66+ A9s+ ATo+ KQs':band===7?'55+ A5s+ A9o+ KJs+ KQo':'33+ A2s+ A5o+ KTs+ QTs+ KJo+';
 if(p===8&&o===7)callSpec=band===10?'22+ A2s+ A2o+ K5s+ K9o+ Q9s+ QTo+ JTs':band===7?'22+ A2s+ A2o+ K2s+ K7o+ Q7s+ Q9o+ J8s+ JTo T9s 98s':'22+ A2s+ A2o+ K2s+ K2o+ Q2s+ Q5o+ J5s+ J8o+ T7s+ T9o 98s 87s';
 const calls=expand(callSpec),decisions:Record<string,Decision>={};
 for(const h of allHands){
  const move:Move=scenario==='open'?(pushRange.has(h)?'jam':'fold'):(calls.has(h)?'callJam':'fold');
  const reason=scenario==='open'?(move==='jam'?'앞선 진입자가 없는 AOF에서 앤티가 있는 팟과 남은 플레이어 수를 고려해, 이 스택 구간의 푸시 레퍼토리에 포함했습니다. AA 같은 프리미엄도 림프·작은 레이즈 대신 올인으로 통일한 단순화입니다.':'앞선 진입자가 없는 AOF라도 모든 핸드로 밀지는 않습니다. 이 포지션과 스택 구간에서 쇼다운 가치·지배 위험·폴드 유도 가능성을 고려해 제외했습니다.'):(move==='callJam'?'상대의 선제 올인 위치와 내 뒤에 남은 플레이어를 고려한 올인 콜 레퍼토리입니다. 선제 푸시보다 폴드 유도 기회가 없어 별도로 좁혀 설계했습니다.':'상대의 올인에 콜하면 폴드 유도로 팟을 가져올 수 없습니다. 선제 푸시에 포함되더라도 필요한 쇼다운 가치와 뒤 플레이어 위험을 고려해 콜 범위에서는 제외할 수 있습니다.');
  decisions[h]=tighten(h,{move,reason:`${depth}BB · ${band===4?'1~4BB':band===7?'5~7BB':'8~10BB'} 구간. ${reason}${depth<=4?' 극단적 숏스택은 실제 팟오즈 변화가 커서 이 구간 공통 추천의 오차가 특히 클 수 있습니다.':''}`,principles:['position','short-stack',scenario==='open'?'fold-equity':'all-in-call']},p,o,depth,scenario);
 }
 return {position,opener,depth,scenario,decisions,sizes:{open:depth,three:null},version:model.version};
}

// v1.1: conservative repertoire. Only removes marginal hands; never widens the v1.0 action set.
function tighten(h:string,d:Decision,p:number,o:number,depth:number,scenario:Scenario):Decision{
 if(d.move==='fold')return d;
 const a=value(h[0]),b=value(h[1]),pair=h.length===2,s=h.endsWith('s'),connector=s&&a-b===1;
 let remove=false;
 if(scenario==='open'){
  if(depth<=10){
   if(p<=2)remove=pair?a<(depth<=7?5:6):s?(a===14?b<8:a===13?b<11:a===12?b<11:a<11):a!==14||b<(p===0?12:11);
   else if(p<=4)remove=pair?a<4:!s?(a===14?b<9:a===13?b<11:b<11):a===14?b<5:a===13?b<9:a===12?b<10:connector&&a<10;
   else if(p===5)remove=!pair&&(!s?(a===14?b<7:a===13?b<10:b<10):a===13?b<7:a===12?b<9:connector&&a<8);
   else if(p>=6)remove=!pair&&(!s?(a===14?b<5:a===13?b<8:a===12?b<9:b<10):a===13?b<4:a===12?b<7:connector&&a<7);
  }else if(p<=2){
   remove=pair?a<(depth<=25?(p===0?7:6):depth<=40?5:4):!s?(a!==14||b<(p===0?12:11)):a===14?b<(depth<=30?10:5):a===13?b<(depth===15?12:11):a===12?b<11:connector&&a<11;
  }else if(p<=4){
   remove=pair?a<(depth<=30?4:3):!s?(a===14?b<10:a===13?b<11:b<11):a===14?b<(depth<=30?8:5):a===13?b<10:a===12?b<10:connector&&a<(depth>=60?9:10);
  }else if(p===5){
   remove=pair?depth<=30&&a<3:!s?(a===14?b<8:a===13?b<10:b<11):a===13?b<8:a===12?b<9:a===11?b<9:connector&&a<8;
  }else if(p===6){
   remove=!pair&&(!s?(a===14?b<5:b<10):a===13?b<5:a===12?b<8:a===11?b<8:connector&&a<7);
  }else if(p===7){
   remove=pair?a<(depth<=30?4:3):!s?(a===14?b<7:b<10):a===13?b<7:a===12?b<9:a===11?b<9:connector&&a<9;
  }
 }else if(d.move==='callJam'){
  remove=pair?a<(o<=2?(p===8?7:8):o<=4?7:5):s?(a===14?b<(o<=2?(p===8?10:11):o<=4?10:8):a===13?b<12:b<11):a===14?b<(o<=2?12:10):a!==13||b<12;
 }else if(d.move==='three'){
  // Keep value cores, reduce speculative polar branches to A5s versus late opens.
  if(s&&a===14&&b<=5)remove=h!=='A5s'||o<5||p===7;
  else if(s&&a<=13&&b<=9)remove=true;
 }else if(d.move==='call'){
  if(pair)remove=a<(depth<=25?6:p===8?4:5);
  else if(!s)remove=a===14?b<(o<=2?12:11):a!==13||b<12;
  else remove=a===14?b<(o<=2?10:o<=4?9:5):a===13?b<(o<=2?12:10):a===12?b<10:connector?a<(p===8&&o>=5?8:10):b<10;
 }else if(d.move==='jam'){
  // Restrict non-premium reshoves. Never remove AA/KK or the strong AK core.
  remove=pair?a<(o<=2?10:o<=4?9:8):a===14?b<(s?(o<=2?12:11):12):a!==13||b<12;
 }
 if(!remove)return {...d,principles:[...d.principles,'conservative']};
 return {move:'fold',reason:`보수적 조정 v1.1 · ${h}는 기존 기본 범위에서 제외했습니다. ${scenario==='open'?(p<=2?'전반부 포지션에서 약한 오프수트·낮은 수딧·작은 페어의 지배 위험과 뒤 플레이어 재공격을 더 엄격하게 반영했습니다.':'뒤 포지션에서도 약한 킥커와 투기적 핸드의 진입을 줄였습니다.'):d.move==='callJam'?'상대 올인에 대한 콜은 폴드 유도 기회가 없어, 약한 A와 낮은 페어·브로드웨이의 콜을 더 제한했습니다.':'상대 오픈에 대한 약한 콜·블로커 블러프·비프리미엄 리쇼브를 줄였습니다.'} 솔버가 이 핸드의 폴드를 증명한 것은 아니며 보수적인 학습 기준입니다.`,principles:[...d.principles,'conservative']};
}
