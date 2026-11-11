import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePostflop,comboMatches,postflopCards,fetchPostflopNode} from '../src/postflop.ts';
test('postflop parsing rejects missing navigation and malformed frequencies',()=>{
 const node={actions:['Check','Bet 5.5'],childSegments:['Check','Bet 5.5'],hands:[{combo:'AsAd',freqs:[.25,.75]}]};
 assert.equal(parsePostflop({node}).hands[0].freqs[1],.75);
 assert.throws(()=>parsePostflop({...node,childSegments:undefined}));
 assert.throws(()=>parsePostflop({...node,hands:[{freqs:[25,75]}]}));
 assert.throws(()=>parsePostflop({...node,hands:[{freqs:[1]}]}));
 assert.equal(comboMatches('Ad As','AsAd'),true);
 assert.deepEqual(postflopCards('3h 3d 2s',['Check','Check','deal:7c']),['3h','3d','2s','7c']);
});
test('node query encodes only exact pack, board, path and combo, captures actual usage',async()=>{
 const original=globalThis.fetch;let requested='';let calls=0;
 globalThis.fetch=async(input,init)=>{calls++;requested=String(input);assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer test');return new Response(JSON.stringify({actions:['Check'],childSegments:['Check'],hands:[{combo:'AsAd',freqs:[1]}]}),{headers:{'X-Usage-Requests-Used':'3'}})};
 try{let used:number|null=null;await fetchPostflopNode('test','pack','3h 3d 2s',['Check'],'AsAd',new AbortController().signal,u=>{used=u.requestsUsed});const url=new URL(requested);assert.equal(url.searchParams.get('path'),'["Check"]');assert.equal(url.searchParams.get('combo'),'AsAd');assert.equal(used,3);assert.equal(calls,1)}finally{globalThis.fetch=original}
});
