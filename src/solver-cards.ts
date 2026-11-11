const order='AKQJT98765432';
export function cardHand(cards:(string|null)[]):string|null{
 if(cards.length!==2||!cards[0]||!cards[1]||cards[0]===cards[1])return null;
 if(cards.some(c=>!c||!/^([AKQJT2-9])[shdc]$/.test(c)))return null;
 const [a,b]=[...cards as string[]].sort((x,y)=>order.indexOf(x[0])-order.indexOf(y[0]));
 return a[0]+b[0]+(a[0]===b[0]?'':a[1]===b[1]?'s':'o');
}
