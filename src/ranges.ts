export const ranks = 'AKQJT98765432'.split('');
export const positions = ['UTG','UTG+1','UTG+2','LJ','HJ','CO','BTN','SB','BB'];
export type Action = 'open'|'call'|'three';
export const allHands = ranks.flatMap((a,i)=>ranks.map((b,j)=>i===j?a+b:i<j?a+b+'s':b+a+'o'));
export function combos(hand:string){return hand.length===2?6:hand.endsWith('s')?4:12}
// Tournament configuration is ready; no verified solver dataset is installed.
// An empty set means unavailable data, never a recommendation to fold.
export const tournamentConfig = { players: 9, format: 'MTT', model: 'chipEV', dataStatus: 'pending' } as const;
export function makeRange(_position:string,_stack:number,_opener:string,_action:Action):Set<string>{
 return new Set();
}
export function concreteHand(h:string):string[]{return [h[0]+'s',h[1]+(h.length===2?'h':h.endsWith('s')?'s':'h')]}
