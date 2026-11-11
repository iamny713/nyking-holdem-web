// Private, per-key browser cache. No solver data or credentials leave this device.
const dbName='nyking-solver-cache';
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(dbName,1);r.onupgradeneeded=()=>r.result.createObjectStore('entries',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function scopedId(key:string,id:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key.trim()));return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('')+':'+id}
export async function readSolverCache<T>(key:string,id:string):Promise<T|null>{
 try{const fullId=await scopedId(key,id),db=await open();return await new Promise(resolve=>{const tx=db.transaction('entries','readonly');const r=tx.objectStore('entries').get(fullId);r.onsuccess=()=>resolve(r.result&&Date.now()-r.result.at<30*86400000?r.result.value:null);r.onerror=()=>resolve(null);tx.oncomplete=()=>db.close();tx.onabort=()=>db.close()})}catch{return null}
}
export async function writeSolverCache(key:string,id:string,value:unknown){
 try{const fullId=await scopedId(key,id),db=await open();await new Promise<void>(resolve=>{const tx=db.transaction('entries','readwrite'),store=tx.objectStore('entries');store.put({id:fullId,at:Date.now(),value});const r=store.getAll();r.onsuccess=()=>{const entries=r.result.sort((a,b)=>b.at-a.at);let bytes=0;for(const e of entries){bytes+=JSON.stringify(e).length*2;if(bytes>20*1024*1024)store.delete(e.id)}};tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();resolve()}})}catch{/* Storage failure must not prevent viewing a result. */}
}
export async function clearSolverCache(){try{const db=await open();await new Promise<void>(resolve=>{const tx=db.transaction('entries','readwrite');tx.objectStore('entries').clear();tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();resolve()}})}catch{/* Optional storage. */}}
