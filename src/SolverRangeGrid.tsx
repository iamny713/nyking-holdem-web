import {allHands} from './ranges';
import {actionName,handStrategy} from './pokerdata';
import type {SolverNode} from './pokerdata';
import {actionTone} from './SolverActionTrail';
const colors:Record<string,string>={fold:'#b0bac4',call:'#8ee3a1',jam:'#ff8188',open:'#7bc5ff',three:'#ffbe70',four:'#bfa0ff',five:'#ff9dde',limp:'#75dfd7'};
export function SolverRangeGrid({node,selected,onSelect}:{node:SolverNode|null;selected:string;onSelect:(hand:string)=>void}){
 return <><div className="solver-grid-legend">{[['Fold','폴드'],['Call','콜'],['Open','오픈'],['3B','3벳'],['4B','4벳'],['5B','5벳'],['AI','올인'],['Limp','림프']].map(([a,label])=><span key={a}><i style={{background:colors[actionTone(a)]}}/>{label}</span>)}</div><p className="hint">칸의 숫자는 가장 큰 액션의 비율입니다. 배경색은 모든 액션의 혼합 비율이며 승률이 아닙니다. 핸드를 누르면 전체 빈도를 확인합니다.</p><div className="matrix recommendation-matrix solver-matrix solver-ratio-grid">{allHands.map(h=>{
 const s=node?handStrategy(node,h):null,rows=s?.valid?s.rows.filter(a=>a.freq>0):[];
 const dominant=[...rows].sort((a,b)=>b.freq-a.freq)[0];let end=0;
 const gradient=rows.map(a=>{const start=end;end+=a.freq/(s?.total??1)*100;return `${colors[actionTone(a.action)]} ${start}% ${end}%`}).join(',');
 const description=rows.map(a=>`${actionName(a.action)} ${(a.freq*100).toFixed(1)}%`).join(', ');
 return <button key={h} title={`${h} · ${description||'조회 데이터 없음'}`} aria-label={`${h} 선택${description?' · '+description:''}`} aria-pressed={selected===h} className={selected===h?'focus':''} style={{background:gradient?`linear-gradient(to right, ${gradient})`:undefined,color:gradient?'#142013':undefined}} onClick={()=>onSelect(h)}><b>{h}</b><small>{dominant?`${(dominant.freq*100).toFixed(0)}%`:node?'—':'·'}</small></button>;
 })}</div></>
}
