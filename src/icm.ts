import {parseNode,readUsage,type SolverNode,type SolverUsage} from './pokerdata.ts';
export type IcmScenario={scenario:string;stackBb:number;bundleStackBb:number;playersLeft:number;table:{stacksBb:Record<string,number>;blinds:{sbBb:number;bbBb:number};ante:{type:string;bb:number};label:string;icm:{paidPlaces:number;payouts:number[];evBaseline:string}}};
export function parseIcmCatalog(raw:unknown):IcmScenario[]{const data=raw as {game?:string;scenarios?:IcmScenario[]};if(data?.game!=='nlh8-icm'||!Array.isArray(data.scenarios)||!data.scenarios.length||data.scenarios.some(s=>!s.scenario||!s.table?.icm||!Array.isArray(s.table.icm.payouts)||!s.table.stacksBb))throw Error('ICM 시나리오 목록 형식을 확인할 수 없습니다.');return data.scenarios}
export async function fetchIcmCatalog(signal:AbortSignal){const r=await fetch('https://pokerdata.io/api/v1/ranges/nlh8-icm',{signal,credentials:'omit'});if(!r.ok)throw Error(`ICM 목록 조회 실패 (${r.status})`);return parseIcmCatalog(await r.json())}
export function parseIcmNode(raw:unknown,scenario:IcmScenario,history:string,hand?:string):SolverNode{
 const n=raw as SolverNode & {scenario?:string};if(!n||n.game!=='nlh8-icm'||n.evUnit!=='usd'||n.scenario!==undefined&&n.scenario!==scenario.scenario)throw Error('요청한 ICM 모델과 응답이 다릅니다.');
 const parsed=parseNode({...n,game:'nlmtt8',stack:scenario.bundleStackBb},scenario.bundleStackBb,history,hand);return {...parsed,game:'nlh8-icm'};
}
export async function fetchIcmNode(key:string,scenario:IcmScenario,history:string,signal?:AbortSignal,hand?:string,onUsage?:(usage:SolverUsage)=>void){
 const q=new URLSearchParams({scenario:scenario.scenario,history});if(hand)q.set('hand',hand);
 const r=await fetch(`https://pokerdata.io/api/v1/ranges/nlh8-icm/node?${q}`,{signal,headers:{Authorization:`Bearer ${key.trim()}`},credentials:'omit',referrerPolicy:'no-referrer'});const u=readUsage(r.headers);if(u)onUsage?.(u);
 if(!r.ok)throw Error(r.status===404?'이 ICM 시나리오의 액션 경로는 제공되지 않습니다. 이전 액션에서 다른 경로를 선택하세요.':r.status===401||r.status===403?'API 키·사용 한도·ICM 데이터 접근 권한을 확인하세요.':r.status===429?'API 요청 한도를 초과했습니다.':`ICM 조회 실패 (${r.status})`);return parseIcmNode(await r.json(),scenario,history,hand);
}
export function scenarioName(s:IcmScenario){return ({even:'균등 스택','short-bb':'BB 숏스택','short-co':'CO 숏스택','big-btn':'BTN 빅스택','big-utg':'UTG 빅스택','mix-1':'혼합 스택 1','mix-2':'혼합 스택 2'} as Record<string,string>)[s.table.label]??s.table.label}
