export const solverSeats=['UTG','UTG1','LJ','HJ','CO','BTN','SB','BB'];
export const solverDepths=[10,15,20,30,40,50,75,100,200,300];
export type PriorAction='Fold'|'Limp'|'Call'|'Open'|'3B'|'4B'|'5B'|'AI';
export type SolverAction={action:string;kind:string;sizeBb?:number|null;weights:Record<string,number>;evs?:Record<string,number>};
export type SolverNode={game:string;stack:number;history:string;actor:string;evUnit:string|null;evBaseline:string|null;actions:SolverAction[]};
export function choices(prior:PriorAction[]):PriorAction[]{
 if(prior.includes('AI'))return ['Fold','Call'];
 const raises=prior.filter(a=>['Open','3B','4B','5B'].includes(a)).length;
 return raises?['Fold','Call',...(raises<4?[(['3B','4B','5B'] as PriorAction[])[raises-1]]:[]),'AI']:['Fold','Limp','Open','AI'];
}
export function historyFor(actor:string,prior:PriorAction[]){
 const index=solverSeats.indexOf(actor);
 if(index<0||prior.length!==index)throw Error('포지션과 앞선 액션을 확인하세요.');
 for(let i=0;i<prior.length;i++)if(!choices(prior.slice(0,i)).includes(prior[i]))throw Error('앞선 액션 순서가 올바르지 않습니다.');
 if(actor==='BB'&&prior.every(a=>a==='Fold'))throw Error('모두 폴드한 BB는 이미 팟을 획득합니다.');
 return [...prior.flatMap((a,i)=>[solverSeats[i],a]),actor].join('_');
}
export function parseNode(raw:unknown,stack:number,history:string,hand?:string):SolverNode{
 const n=raw as SolverNode;
 if(!n||n.game!=='nlmtt8'||n.stack!==stack||n.history!==history||n.actor!==history.split('_').at(-1)||!Array.isArray(n.actions)||!n.actions.length)throw Error('API 응답이 요청한 상황과 다릅니다. 결과를 표시하지 않았습니다.');
 for(const a of n.actions){
  if(hand){const single=a as SolverAction & {freq?:number;frequency?:number;ev?:number};const frequency=single.freq??single.frequency;if(!a.weights&&typeof frequency==='number')a.weights={[hand]:frequency};if(!a.evs&&typeof single.ev==='number')a.evs={[hand]:single.ev}}
  if(typeof a.action!=='string'||typeof a.weights!=='object'||!a.weights)throw Error('API 레인지 형식을 확인할 수 없습니다.');
  if(Object.values(a.weights).some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>1))throw Error('API 빈도 값이 유효하지 않습니다.');
 }
 return n;
}
export function handStrategy(node:SolverNode,hand:string){
 const rows=node.actions.map(a=>({action:a.action,kind:a.kind,sizeBb:a.sizeBb,freq:a.weights[hand]??0,ev:typeof a.evs?.[hand]==='number'&&Number.isFinite(a.evs[hand])?a.evs[hand]:null}));
 const total=rows.reduce((sum,a)=>sum+a.freq,0);
 return {rows,total,valid:Math.abs(total-1)<.025};
}
export const actionName=(action:string)=>({Fold:'폴드',Call:'콜',Limp:'림프',Open:'오픈','3B':'3벳','4B':'4벳','5B':'5벳',AI:'올인'} as Record<string,string>)[action]??action;
export async function fetchSolverNode(key:string,stack:number,history:string,signal?:AbortSignal,hand?:string){
 const query=new URLSearchParams({stack:String(stack),history});if(hand)query.set('hand',hand);
 const response=await fetch(`https://pokerdata.io/api/v1/ranges/nlmtt8/node?${query}`,{headers:{Authorization:`Bearer ${key.trim()}`},signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(response.status===401||response.status===403?'API 키 또는 이 데이터의 접근 권한을 확인하세요.':response.status===429?'무료 호출 한도 또는 요청 속도를 초과했습니다. PokerData 대시보드를 확인하세요.':response.status===404?'이 액션 경로의 계산 결과가 제공되지 않습니다. 다른 조건으로 바꾸세요.':`조회 실패 (${response.status}). 잠시 후 다시 시도하세요.`);
 return parseNode(await response.json(),stack,history,hand);
}

// Catalog addresses, rather than guessed action labels, define the input tree.
export function parseSpots(raw:unknown):string[]{
 const found=new Set<string>();
 const isHistory=(s:string)=>/^(UTG|UTG1|LJ|HJ|CO|BTN|SB|BB)(_[A-Za-z0-9%+.-]+_(UTG|UTG1|LJ|HJ|CO|BTN|SB|BB))*$/.test(s);
 const visit=(v:unknown)=>{if(typeof v==='string'){if(isHistory(v))found.add(v)}else if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){if(isHistory(k))found.add(k);if(['spots','nodes','histories','history','path','data','results'].includes(k))visit(x)}};
 visit(raw);if(!found.size)throw Error('지원 상황 목록의 형식을 확인할 수 없습니다. 추정 액션을 표시하지 않았습니다.');
 return [...found];
}
export function nextSteps(histories:string[],prefix:string){
 const edges=new Map<string,{action:string;next:string}>();
 for(const history of histories){if(!history.startsWith(prefix+'_'))continue;const suffix=history.slice(prefix.length+1).split('_');if(suffix.length<2)continue;const [action,seat]=suffix;edges.set(`${action}:${seat}`,{action,next:`${prefix}_${action}_${seat}`})}
 return [...edges.values()];
}
export function pathDecisions(history:string){const parts=history.split('_');return parts.flatMap((actor,i)=>i%2===0&&i<parts.length-1?[{actor,action:parts[i+1],history:parts.slice(0,i+1).join('_')}]:[])}
export function dominantStrategy(node:SolverNode,hand:string){const s=handStrategy(node,hand);if(!s.valid)return null;const rows=[...s.rows].filter(r=>r.freq>0).sort((a,b)=>b.freq-a.freq);return {rows,mixed:rows.filter(r=>r.freq>=.01).length>1,main:rows[0]}}
export async function fetchSolverSpots(key:string,stack:number,signal?:AbortSignal){
 const response=await fetch(`https://pokerdata.io/api/v1/ranges/nlmtt8/spots?stack=${stack}`,{headers:{Authorization:`Bearer ${key.trim()}`},signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(response.status===429?'요청 한도를 초과했습니다.':response.status===401||response.status===403?'API 키와 데이터 접근 권한을 확인하세요.':`지원 상황 목록 조회 실패 (${response.status})`);
 return parseSpots(await response.json());
}
export type SolverConfig={game:string;stack:number;blinds:{sb:number;bb:number};ante:number;antePostedBy:string;stacks:number[]|null;openSizes:{open:{label:string;sizeBb:number};sb:{label:string;sizeBb:number};note?:string|null}};
export async function fetchSolverConfig(stack:number,signal?:AbortSignal):Promise<SolverConfig>{
 const response=await fetch(`https://pokerdata.io/api/v1/ranges/nlmtt8/config?stack=${stack}`,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error('게임 조건을 불러오지 못했습니다.');const c=await response.json();if(c.game!=='nlmtt8'||c.stack!==stack||!c.blinds||!c.openSizes)throw Error('게임 조건 형식을 확인할 수 없습니다.');return c;
}

// Local input builder: legal simplified actions, not a claim of provider coverage.
export function localSteps(history:string){
 function state(path:string){
  const active=new Set(solverSeats),allin=new Set<string>();let pending=new Set(solverSeats);let raises=0;
  for(const d of pathDecisions(path)){
   pending.delete(d.actor);
   if(d.action==='Fold')active.delete(d.actor);
   else if(!['Call','Limp','Check'].includes(d.action)){
    raises++;if(d.action==='AI')allin.add(d.actor);
    pending=new Set([...active].filter(p=>p!==d.actor&&!allin.has(p)));
   }
  }
  return {active,allin,pending,raises};
 }
 const actor=history.split('_').at(-1)!;
 if(!solverSeats.includes(actor))return [];
 const current=state(history);
 if(current.active.size<=1||!current.pending.size)return [];
 const options: string[]=current.raises?['Fold','Call',...(!current.allin.size?[...(current.raises<4?[current.raises===1?'3B':current.raises===2?'4B':'5B']:[]),'AI']:[])]:['Fold',actor==='BB'?'Call':'Limp','Open','AI'];
 return options.flatMap(action=>{
  const s=state(`${history}_${action}_UTG`); // placeholder actor is ignored by pathDecisions
  if(s.active.size<=1||!s.pending.size)return [];
  const index=solverSeats.indexOf(actor);
  for(let offset=1;offset<=solverSeats.length;offset++){const next=solverSeats[(index+offset)%solverSeats.length];if(s.pending.has(next)&&s.active.has(next)&&!s.allin.has(next))return [{action,next:`${history}_${action}_${next}`}];}
  return [];
 });
}
