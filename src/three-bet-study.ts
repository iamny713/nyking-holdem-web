import {expand,type Recommendation,type Decision} from './recommendations.ts';
import {positions,combos} from './ranges.ts';
export type ThreeKind='value'|'linear'|'bluff';
export type BluffCandidate={hand:string;why:string;useWhen:string;avoidWhen:string;responseToFourBet:string};
export function threeKind(h:string,d:Decision,r:Recommendation):ThreeKind|null{
 if(d.move!=='three')return null;
 if(d.principles.includes('blockers'))return 'bluff';
 const o=positions.indexOf(r.opener);
 const core=expand(o>=5?'TT+ AQs+ AKo':o>=3?'JJ+ AKs AKo':'QQ+ AKs AKo');
 return core.has(h)?'value':'linear';
}
export const kindLabels:Record<ThreeKind,string>={value:'밸류 중심 3벳',linear:'리니어 확장 3벳',bluff:'블러프 3벳'};
export const kindColors:Record<ThreeKind,string>={value:'#e8c185',linear:'#b5c98b',bluff:'#ef9d90'};
export function bluffCandidates(r:Recommendation):BluffCandidate[]{
 if(r.scenario!=='response'||r.depth<30)return [];
 const p=positions.indexOf(r.position),o=positions.indexOf(r.opener);
 if(o<3||p<=o)return [];
 const late=o>=5,ip=p<7;
 let hands:string[]=[];
 if(r.depth>=40&&(late||ip&&o>=3))hands=['A5s','A4s'];
 else if(r.depth===30&&late&&ip)hands=['A5s'];
 if(r.depth>=60&&late&&(ip||p===8))hands.push('A3s');
 if(r.depth>=80&&late&&ip)hands.push('K9s','Q9s');
 return hands.filter(h=>['fold','call'].includes(r.decisions[h].move)).map(h=>({hand:h,
  why:h.startsWith('A')?'A 블로커와 넛 플러시 잠재력을 가진 수딧 에이스입니다. 기본 추천에서 제외하거나 콜로 남긴 핸드를 폴드 유도가 가능한 상황의 대안 후보로 보여줍니다.':'수딧 고카드의 연결성과 상대의 넓은 오픈을 이용하는 확장 후보입니다. A 블로커가 없어 휠 에이스보다 더 신중하게 취급합니다.',
  useWhen:`${r.position} vs ${r.opener}, ${r.depth}BB. ${ip?'포지션에서 플레이 가능하고':'포지션 불리함을 감수할 수 있고'} 상대가 넓게 오픈하면서 3벳에는 충분히 폴드하는 근거가 있을 때만 검토합니다.`,
  avoidWhen:`상대가 타이트하게 오픈하거나 넓게 콜/4벳하는 경우, ICM 압박·뒤 플레이어 스퀴즈·큰 오픈이 있는 경우에는 제외합니다.${r.depth===30?' 30BB에서는 4벳 올인 압박과 낮은 SPR 때문에 우선순위가 낮습니다.':''}${p===7?' SB에서는 BB가 남아 있고 포스트플랍도 OOP이므로 더 보수적으로 다룹니다.':''}`,
  responseToFourBet:'이 앱은 4벳 대응 범위를 계산하지 않습니다. 이 후보를 4벳 올인 콜이나 5벳 올인 추천으로 해석하지 마세요.'}));
}
export function studyHands(r:Recommendation,kind:ThreeKind|'candidate'){
 return kind==='candidate'?bluffCandidates(r).map(c=>c.hand):Object.keys(r.decisions).filter(h=>threeKind(h,r.decisions[h],r)===kind);
}
export function studyCombos(hands:string[]){return hands.reduce((n,h)=>n+combos(h),0)}
