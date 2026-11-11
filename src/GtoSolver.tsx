import {useState} from 'react';
import {SolverExplorer} from './SolverExplorer';
import {PostflopExplorer} from './PostflopExplorer';
export function GtoSolver(){const [mode,setMode]=useState('pre'),[opened,setOpened]=useState(false);return <><div className="postflop-next" role="group" aria-label="솔버 스트리트"><button className={mode==='pre'?'active':''} aria-pressed={mode==='pre'} onClick={()=>setMode('pre')}>프리플랍 · MTT 8-max</button><button className={mode==='post'?'active':''} aria-pressed={mode==='post'} onClick={()=>{setOpened(true);setMode('post')}}>포스트플랍 · 헤즈업 팩</button></div><div hidden={mode!=='pre'}><SolverExplorer/></div>{opened&&<div hidden={mode!=='post'}><PostflopExplorer/></div>}</>}
