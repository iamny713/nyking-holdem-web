import React from 'react';
import {createRoot} from 'react-dom/client';
import {HandSimulator} from './HandSimulator';
import {SiteHeader,SiteFooter} from './SiteHeader';
import './style.css';
function SimulatorPage(){return <main><SiteHeader/><div className="sim-only-label">핸드 시뮬레이터</div><HandSimulator/><SiteFooter/></main>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><SimulatorPage/></React.StrictMode>);
