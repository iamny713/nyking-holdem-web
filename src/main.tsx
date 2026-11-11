import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {HandSimulator} from './HandSimulator';
import {SiteHeader,SiteFooter} from './SiteHeader';
import {RangeExplorer} from './RangeExplorer';
import {ComboCalculator} from './ComboCalculator';
import './style.css';
import {SolverExplorer} from './SolverExplorer';
function App(){
 const [tab,setTab]=useState('sim');
 const [incoming,setIncoming]=useState<{hand:string;request:number}|null>(null);
 const send=(hand:string)=>{setIncoming(previous=>({hand,request:(previous?.request??0)+1}));setTab('sim')};
 return <main><SiteHeader/><nav aria-label="기능 탭"><button className={tab==='sim'?'active':''} onClick={()=>setTab('sim')}>01 <b>핸드 시뮬레이터</b></button><button className={tab==='solver'?'active':''} onClick={()=>setTab('solver')}>02 <b>GTO solver</b></button><button className={tab==='range'?'active':''} onClick={()=>setTab('range')}>03 <b>프리플랍 레인지</b></button><button className={tab==='combos'?'active':''} onClick={()=>setTab('combos')}>04 <b>콤보 계산기</b></button></nav><div hidden={tab!=='sim'}><HandSimulator incoming={incoming}/></div><section hidden={tab!=='range'}><RangeExplorer onSend={send}/></section><section hidden={tab!=='combos'}><ComboCalculator/></section><section hidden={tab!=='solver'}><SolverExplorer/></section><SiteFooter/></main>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
