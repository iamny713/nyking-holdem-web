import pdfData from './reference-data.json' with {type:'json'};
import bookData from './book-data.json' with {type:'json'};
import {allHands,combos,type Action} from './ranges.ts';
export type Source = 'pdf'|'book'|'tournament';
export type Frequencies = {raise:number;call:number;fold:number};
export type Reference = {id:string;citation:string;conditions:string;approximate:boolean;frequencies:Record<string,Frequencies>;raiseSize:number|null};
export const sourcePositions = {pdf:['UTG','UTG+1','LJ','HJ','CO','BTN','SB','BB'],book:['EP','MP','CO','BTN'],tournament:['UTG','UTG+1','UTG+2','LJ','HJ','CO','BTN','SB','BB']};
export function lookupReference(source:Source,position:string,stack:number,opener:string,action:Action):Reference|null {
 if(!Number.isFinite(stack)||stack<=0)return null;
 if(source==='pdf'){
  const chart=pdfData.find(c=>c.position===position&&c.stack===stack&&c.scenario===(action==='open'?'open':'response')&&(action==='open'||c.opener===opener));
  if(!chart)return null;
  return {id:chart.id,citation:`The Ultimate Cash Game Preflop Guide · 2026 · p.${chart.page}`,conditions:`8개 포지션 캐시 차트 · ${stack} BB · 앤티·레이크 세부값은 제공 자료에 미기재`,approximate:true,frequencies:chart.frequencies,raiseSize:chart.scenario==='open'?(position==='SB'?4:3):(['SB','BB'].includes(position)?12:10)};
 }
 if(source==='book'&&action==='open'&&stack>=12&&stack<=100){
  const chart=bookData.find(c=>c.position===position&&c.depth===(stack>=40?'deep':'medium'));
  if(!chart)return null;
  return {id:chart.id,citation:`Mastering Small Stakes No-Limit Hold’em · ${chart.chapter} · Diagram ${chart.diagram}`,conditions:`저자 기본 오픈 전략 · ${stack>=40?'40~100':'12~40 미만'} BB · EP/MP는 저자의 포지션 그룹 · 특정 앤티·ICM 솔루션 아님`,approximate:false,frequencies:Object.fromEntries(allHands.map(h=>[h,{raise:chart.hands.includes(h)?1:0,call:0,fold:chart.hands.includes(h)?0:1}])),raiseSize:null};
 }
 return null;
}
export function actionFrequency(f:Frequencies,action:Action){return action==='call'?f.call:f.raise}
export function weightedFrequency(reference:Reference,action:Action){return allHands.reduce((n,h)=>n+combos(h)*actionFrequency(reference.frequencies[h],action),0)/1326}
export function missingReason(source:Source,position:string,stack:number,action:Action){
 if(!Number.isFinite(stack)||stack<=0)return '유효스택을 양수로 입력하세요.';
 if(source==='tournament')return '제공된 자료에는 9맥스 토너먼트의 앤티·ICM 조건별 솔버 데이터가 없습니다. 자료 참고 모드에서 원문 기준 전략을 볼 수 있습니다.';
 if(source==='pdf'&&![100,200].includes(stack))return 'PDF에는 100BB와 200BB 차트만 있습니다. 다른 스택으로 보간하지 않습니다.';
 if(source==='book'&&action!=='open')return '이 교재 모드에는 기본 오픈 차트 8개를 수록했습니다. 플랫콜·3벳은 PDF 모드를 선택하세요.';
 if(source==='book'&&(stack<12||stack>100))return '수록한 교재 기본 오픈 차트는 12~100BB입니다. 12BB 미만 푸시/폴드나 100BB 초과 전략으로 확장하지 않습니다.';
 if(position==='BB'&&action==='open')return 'BB는 앞선 플레이어가 모두 폴드하면 팟을 획득하므로 RFI 차트가 없습니다.';
 return '선택한 포지션·액션 조합은 수록된 차트에 없습니다.';
}
