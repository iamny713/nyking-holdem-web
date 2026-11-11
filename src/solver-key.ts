import {useEffect,useState} from 'react';
const keyId='nyking.pokerdata.api-key.v1',event='nyking-pokerdata-key-change';
function saved(){try{return localStorage.getItem(keyId)??''}catch{return ''}}
export function usePokerDataKey(){
 const [key,setKey]=useState(saved);
 useEffect(()=>{const sync=(e:Event)=>setKey((e as CustomEvent<string>).detail??saved());window.addEventListener(event,sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener(event,sync);window.removeEventListener('storage',sync)}},[]);
 const update=(value:string)=>{setKey(value);try{if(value.trim())localStorage.setItem(keyId,value.trim());else localStorage.removeItem(keyId)}catch{/* Keep the key only in memory when storage is unavailable. */}window.dispatchEvent(new CustomEvent(event,{detail:value}))};
 return [key,update] as const;
}
