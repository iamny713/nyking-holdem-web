import {readUsage,type SolverUsage} from './pokerdata.ts';
export type PostflopPack={id:string;title:string;stackBb:number;oopPos:string;ipPos:string;potBb:number;sizingTrees:{tree:string;packId:string;betSizing:string}[];boards:{board:string;trees:string[];queryable?:boolean;actionEv?:{available:boolean}}[]};
export type PostflopNode={actions:(string|{label?:string;name?:string;type?:string;add?:number})[];childSegments:string[];hands:{combo?:string;hand?:string;freqs:number[];action_ev?:number[];ev_loss?:number[]}[];board?:string|string[];pot?:number;player?:string|number;actor?:string;path?:string[]};
export function parsePostflop(raw:unknown):PostflopNode{
 const envelope=raw as {node?:unknown};const n=(envelope?.node??raw) as PostflopNode;
 if(!n||!Array.isArray(n.actions)||!Array.isArray(n.childSegments)||!n.childSegments.every(s=>typeof s==='string')||!Array.isArray(n.hands))throw Error('포스트플랍 응답 형식 확인: '+JSON.stringify(responseShape(raw)));
 for(const h of n.hands)if(!Array.isArray(h.freqs)||h.freqs.length!==n.actions.length||h.freqs.some(f=>typeof f!=='number'||!Number.isFinite(f)||f<0||f>1))throw Error('액션 빈도 형식이 올바르지 않습니다.');
 return n;
}
export function comboMatches(value:string|undefined,combo:string){return !!value&&[combo,combo.slice(2)+combo.slice(0,2)].includes(value.replace(/\s/g,''))}
export function postflopCards(board:string,path:string[]){return [...board.split(' '),...path.filter(p=>/^deal:[2-9TJQKA][shdc]$/.test(p)).map(p=>p.slice(5))]}
export function actionLabel(a:PostflopNode['actions'][number]){return typeof a==='string'?a:a.label??a.name??(a.type?`${a.type}${a.add===undefined?'':` ${a.add}`}`:'액션')}
export async function fetchPostflopCatalog(signal?:AbortSignal):Promise<PostflopPack[]>{
 const r=await fetch('https://pokerdata.io/api/v1/postflop/catalog',{signal,credentials:'omit'});if(!r.ok)throw Error(`지원 목록 조회 실패 (${r.status})`);const data=await r.json();
 if(!Array.isArray(data.packs)||!data.packs.every((p:PostflopPack)=>p.id&&Array.isArray(p.boards)&&Array.isArray(p.sizingTrees)))throw Error('지원 목록 형식을 확인할 수 없습니다.');return data.packs;
}
export async function fetchPostflopNode(key:string,pack:string,board:string,path:string[],combo:string,signal:AbortSignal,onUsage:(usage:SolverUsage)=>void){
 const q=new URLSearchParams({pack,board,path:JSON.stringify(path),combo});
 const r=await fetch(`https://pokerdata.io/api/v1/postflop/node?${q}`,{headers:{Authorization:`Bearer ${key.trim()}`},signal,credentials:'omit',referrerPolicy:'no-referrer'});const usage=readUsage(r.headers);if(usage)onUsage(usage);
 if(!r.ok)throw Error(r.status===404?'이 보드 또는 액션 경로의 결과가 없습니다.':r.status===401||r.status===403?'API 키 또는 포스트플랍 접근 권한을 확인하세요.':r.status===429?'API 요청 한도를 확인하세요.':`포스트플랍 조회 실패 (${r.status})`);
 return parsePostflop(await r.json());
}

function responseShape(v:unknown,depth=0):unknown{if(depth>3)return typeof v;if(Array.isArray(v))return {length:v.length,first:responseShape(v[0],depth+1)};if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,responseShape(x,depth+1)]));return typeof v}
