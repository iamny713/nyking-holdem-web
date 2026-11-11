const COMB=[];for(let a=0;a<3;a++)for(let b=a+1;b<4;b++)for(let c=b+1;c<5;c++)for(let d=c+1;d<6;d++)for(let e=d+1;e<7;e++)COMB.push([a,b,c,d,e]);function eval5(cards,ix){let ct=new Uint8Array(15),su=new Uint8Array(4),rr=[];for(let j=0;j<5;j++){let v=cards[ix[j]],r=(v%13)+2;ct[r]++;su[(v/13)|0]++;}for(let r=14;r>=2;r--)if(ct[r])rr.push(r);let flush=su.includes(5),straight=0;for(let h=14;h>=5;h--){let ok=true;for(let k=0;k<5;k++){let r=h-k;if(r===1)r=14;if(!ct[r]){ok=false;break}}if(ok){straight=h;break}}let groups=[];for(let r=14;r>=2;r--)if(ct[r])groups.push([ct[r],r]);groups.sort((a,b)=>b[0]-a[0]||b[1]-a[1]);let cat,k;if(flush&&straight){cat=8;k=[straight]}else if(groups[0][0]===4){cat=7;k=[groups[0][1],groups[1][1]]}else if(groups[0][0]===3&&groups[1][0]===2){cat=6;k=[groups[0][1],groups[1][1]]}else if(flush){cat=5;k=rr}else if(straight){cat=4;k=[straight]}else if(groups[0][0]===3){cat=3;k=[groups[0][1],...groups.slice(1).map(x=>x[1])]}else if(groups[0][0]===2&&groups[1][0]===2){cat=2;k=[Math.max(groups[0][1],groups[1][1]),Math.min(groups[0][1],groups[1][1]),groups[2][1]]}else if(groups[0][0]===2){cat=1;k=[groups[0][1],...groups.slice(1).map(x=>x[1])]}else{cat=0;k=rr}let score=cat;for(let i=0;i<5;i++)score=score*15+(k[i]||0);return score}function evaluate(c){let best=0;for(let ix of COMB){let v=eval5(c,ix);if(v>best)best=v}return best}// A fixed board is never resampled. Postflop defaults to complete enumeration.
onmessage=e=>{
 const {hole,board=[],n=10000,exact=board.length>0}=e.data;
 const known=[...hole,...board];
 if(!Array.isArray(hole)||hole.length!==4||![0,3,4,5].includes(board.length)||known.some(c=>!Number.isInteger(c)||c<0||c>51)||new Set(known).size!==known.length||!Number.isInteger(n)||n<1||n>1000000){postMessage({error:'카드 또는 계산 조건이 올바르지 않습니다.'});return}
 const remain=[];for(let i=0;i<52;i++)if(!known.includes(i))remain.push(i);
 const missing=5-board.length;
 const a=[hole[0],hole[1],...board,...Array(missing).fill(0)],b=[hole[2],hole[3],...board,...Array(missing).fill(0)];
 const wins=[0,0,0],t=performance.now();let done=0;
 const full=exact&&missing<=2;
 const total=full?(missing===2?remain.length*(remain.length-1)/2:missing===1?remain.length:1):n;
 function compare(){const x=evaluate(a),y=evaluate(b);wins[x>y?0:x<y?1:2]++;done++;if(done%1000===0)postMessage({done,n:total,wins,ms:performance.now()-t})}
 function place(values){for(let j=0;j<values.length;j++)a[2+board.length+j]=b[2+board.length+j]=values[j];compare()}
 if(full){
  if(missing===2){for(let i=0;i<remain.length-1;i++)for(let j=i+1;j<remain.length;j++)place([remain[i],remain[j]])}
  else if(missing===1){for(const c of remain)place([c])}
  else compare();
 }else{
  while(done<n){const swapped=[];for(let j=0;j<missing;j++){const pick=j+Math.floor(Math.random()*(remain.length-j));[remain[j],remain[pick]]=[remain[pick],remain[j]];swapped.push(pick);a[2+board.length+j]=b[2+board.length+j]=remain[j]}compare();for(let j=missing-1;j>=0;j--){const pick=swapped[j];[remain[j],remain[pick]]=[remain[pick],remain[j]]}}
 }
 postMessage({complete:true,done,n:total,wins,ms:performance.now()-t,method:full?'exact':'monte-carlo',board});
};
