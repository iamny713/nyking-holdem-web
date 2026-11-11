import {actionName,pathDecisions} from './pokerdata';
export function actionTone(action:string){
 const token=action.split('-')[0];
 return ({Fold:'fold',Call:'call',AI:'jam',Open:'open','3B':'three','4B':'four','5B':'five',Limp:'limp',Check:'call'} as Record<string,string>)[token]??'open';
}
export function SolverActionTrail({history,sizes}:{history:string;sizes:Record<string,number|undefined>}){
 const decisions=pathDecisions(history),actor=history.split('_').at(-1)!;
 const seat=(p:string)=>p==='UTG1'?'UTG+1':p;
 return <ol className="solver-action-flow" aria-label="선택한 액션 순서">{decisions.map((d,i)=><li key={i} className={`solver-tone-${actionTone(d.action)}`}><span className="solver-flow-seat">{seat(d.actor)}</span><b>{actionName(d.action.split('-')[0])}</b>{typeof sizes[d.history]==='number'&&<small>총 {sizes[d.history]!.toFixed(2)}BB</small>}</li>)}<li className="solver-flow-current"><span className="solver-flow-seat">{seat(actor)}</span><b>현재 결정</b></li></ol>
}
