/* KT Companion — guardado + PDF v4
   - Guarda armas seleccionadas de forma robusta.
   - Captura el campo táctico T1-T4 como imagen.
   - PDF real con portada + mapa por turno.
*/
(function(){
'use strict';
const F=()=>document.getElementById('game'), D=()=>F()?.contentDocument||null, W=()=>F()?.contentWindow||null;
const KEY='kt_companion_matrices_pdf2', FIELD='kt_tactical_field_v2';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=x=>Array.isArray(x)?x:[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function readSaved(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
function weaponsFromDOM(side){
 const d=D(),w=W(); if(!d||!w)return[];
 try{w.switchSide?.(side)}catch(e){}
 const out=[];
 d.querySelectorAll('#ops .op.has').forEach(op=>{
   const name=(op.querySelector('.opname')?.childNodes[0]?.textContent||op.querySelector('.opname')?.textContent||'').trim();
   const selected=[];
   op.querySelectorAll('.weapon button.on').forEach(b=>{
     const row=b.closest('.weapon');
     const wn=(row?.querySelector('.wname')?.textContent||b.textContent||'').trim();
     if(wn&&!selected.includes(wn))selected.push(wn);
   });
   if(name&&selected.length)out.push({name,weapons:selected});
 });
 return out;
}
function fieldState(){try{return JSON.parse(localStorage.getItem(FIELD)||'{}')}catch(e){return{}}}
function selectedMap(){return D()?.querySelector('.mapchoice.selected')?.textContent.trim()||''}
function mapSrc(){const d=D(),w=W(),map=selectedMap();return w?.__ktMapImages?.[map]||localStorage.getItem('kt_map_'+map)||d?.querySelector('#ktField #ktimg')?.src||''}
async function imageToDataURL(src,wantW,wantH){
 return new Promise(resolve=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');const Wd=wantW||im.naturalWidth||1000,Hd=wantH||Math.round(Wd*(im.naturalHeight/im.naturalWidth||.7));c.width=Wd;c.height=Hd;const x=c.getContext('2d');x.drawImage(im,0,0,Wd,Hd);resolve({url:c.toDataURL('image/jpeg',.88),w:Wd,h:Hd})};im.onerror=()=>resolve(null);im.src=src})
}
async function snapshotTurn(t){
 const w=W(),d=D();if(!w||!d)return null;
 const current=w.__ktCurrentTurn||1;
 try{w.switchTurn?.(t);await sleep(180)}catch(e){}
 const field=d.querySelector('#ktField'),img=d.querySelector('#ktField #ktimg'),board=d.querySelector('#ktField .ktboard');
 if(!field||!img||!board||!img.complete){try{w.switchTurn?.(current)}catch(e){};return null}
 const bw=Math.max(900,board.clientWidth||900),bh=Math.round(bw*(img.naturalHeight/img.naturalWidth||.7));
 const c=document.createElement('canvas');c.width=bw;c.height=bh;const x=c.getContext('2d');
 try{x.drawImage(img,0,0,bw,bh)}catch(e){}
 // drawings canvas
 const dc=field.querySelector('.ktcanvas');if(dc&&dc.width){try{x.drawImage(dc,0,0,bw,bh)}catch(e){}}
 field.querySelectorAll('.ktm.friend,.ktm.enemy').forEach(m=>{const px=parseFloat(m.style.left)||0,py=parseFloat(m.style.top)||0;const r= m.classList.contains('friend')?'#1976d2':'#d72d2d';const cx=px/100*bw,cy=py/100*bh;const rad=Math.max(14,bw*.018);x.beginPath();x.arc(cx,cy,rad,0,Math.PI*2);x.fillStyle=r;x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.font='900 '+Math.max(11,Math.round(rad*.75))+'px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(m.textContent,cx,cy)});
 const url=c.toDataURL('image/jpeg',.86);try{w.switchTurn?.(current)}catch(e){};await sleep(60);return {turn:t,url,w:bw,h:bh,map:selectedMap()}
}
async function captureBattlefields(){const out={};for(let t=1;t<=4;t++){const s=await snapshotTurn(t);if(s)out[t]=s}return out}
async function augmentLastSaved(){
 const a=readSaved();if(!a.length)return;
 const s=a[0];s.weapons=s.weapons||{};s.weapons.friend=weaponsFromDOM('friend');if(s.enemy)s.weapons.enemy=weaponsFromDOM('enemy');
 s.battlefields=await captureBattlefields();s.mapImage=mapSrc();
 localStorage.setItem(KEY,JSON.stringify(a));
 try{window.showSaved?.()}catch(e){}
}
const oldSave=window.saveGame;
window.saveGame=async function(){
 if(typeof oldSave!=='function'){alert('No se ha cargado el módulo de guardado.');return}
 oldSave();
 await sleep(350);
 try{await augmentLastSaved()}catch(e){console.error('KT save v4',e)}
}
function pdfAscii(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').replace(/\s+/g,' ').trim()}
function txt(s){return pdfAscii(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function b64bytes(data){const b=atob(data.split(',')[1]||'');const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function ascii(s){return new TextEncoder().encode(s)}
function join(parts){let n=parts.reduce((a,b)=>a+b.length,0),o=new Uint8Array(n),p=0;for(const b of parts){o.set(b,p);p+=b.length}return o}
function makePDF(pages){
 // pages: [{title,lines,image:{url,w,h}}]
 const objs=[];objs[0]='<< /Type /Catalog /Pages 2 0 R >>';objs[1]='';let n=3,refs=[];
 pages.forEach(pg=>{const p=n++,c=n++,img=pg.image?n++:null;refs.push({p,c,img,pg})});const font=n++;objs[1]='<< /Type /Pages /Kids ['+refs.map(r=>r.p+' 0 R').join(' ')+'] /Count '+refs.length+' >>';
 refs.forEach((r,i)=>{
   const pg=r.pg,commands=['BT','/F1 16 Tf','42 800 Td','('+txt(pg.title)+') Tj','/F1 10 Tf','14 TL'];
   (pg.lines||[]).forEach((line,j)=>{commands.push('T*','('+txt(line.slice(0,105))+') Tj')});commands.push('ET');let y=800-18-14*(pg.lines||[]).length;
   if(r.img){const w=Math.min(510,pg.image.w||900),h=Math.min(500,(pg.image.h||600)*w/(pg.image.w||900));commands.push('q',String(w)+' 0 0 '+String(h)+' 42 '+Math.max(42,y-h-20)+' cm','/Im1 Do','Q')}
   const stream=commands.join('\n');objs[r.p-1]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 '+font+' 0 R >>'+(r.img?' /XObject << /Im1 '+r.img+' 0 R >>':'')+' >> /Contents '+r.c+' 0 R >>';objs[r.c-1]='<< /Length '+ascii(stream).length+' >>\nstream\n'+stream+'\nendstream';
   if(r.img){const u=b64bytes(pg.image.url);objs[r.img-1]={jpeg:u,w:pg.image.w,h:pg.image.h}}
 });objs[font-1]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
 const chunks=[ascii('%PDF-1.4\n')],offsets=[0];let pos=chunks[0].length;
 for(let i=0;i<objs.length;i++){offsets[i+1]=pos;const head=ascii((i+1)+' 0 obj\n');chunks.push(head);pos+=head.length;const o=objs[i];if(o&&o.jpeg){const pre=ascii('<< /Type /XObject /Subtype /Image /Width '+o.w+' /Height '+o.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+o.jpeg.length+' >>\nstream\n');const post=ascii('\nendstream\nendobj\n');chunks.push(pre,o.jpeg,post);pos+=pre.length+o.jpeg.length+post.length}else{const bb=ascii(String(o)+'\nendobj\n');chunks.push(bb);pos+=bb.length}}
 const xref=pos;let tail='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';for(let i=1;i<=objs.length;i++)tail+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';tail+='trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';chunks.push(ascii(tail));return new Blob(chunks,{type:'application/pdf'})
}
async function exportPDF(i){const a=readSaved(),s=a[i];if(!s)return;const pages=[];pages.push({title:'KT Companion — ALPHA VERSION',lines:['Cuaderno de batalla','Ejercito amigo: '+s.friend,'Ejercito rival: '+(s.enemy||'—'),'Mapa: '+s.map,'Operacion: '+s.operation,'','AMIGO — Operativos: '+Object.entries(s.counts?.friend||{}).map(([n,q])=>n+(q>1?' x'+q:'')).join(', '),'AMIGO — Armas: '+(s.weapons?.friend||[]).map(x=>x.name+': '+(x.weapons||[]).join(', ')).join(' | '),'','RIVAL — Operativos: '+Object.entries(s.counts?.enemy||{}).map(([n,q])=>n+(q>1?' x'+q:'')).join(', '),'RIVAL — Armas: '+(s.weapons?.enemy||[]).map(x=>x.name+': '+(x.weapons||[]).join(', ')).join(' | ')]});
 for(let t=1;t<=4;t++){const f=s.turns?.friend?.[t]||{},r=s.turns?.enemy?.[t]||{};pages.push({title:'TURNO '+t,lines:['AMIGO — Estrategia: '+(arr(f.strategy).join(', ')||'—'),'AMIGO — Tiroteo: '+(arr(f.firefight).join(', ')||'—'),'AMIGO — Equipo faccion: '+(arr(f.faction).join(', ')||'—'),'AMIGO — Equipo universal: '+(arr(f.universal).join(', ')||'—'),...(s.enemy?['RIVAL — Estrategia: '+(arr(r.strategy).join(', ')||'—'),'RIVAL — Tiroteo: '+(arr(r.firefight).join(', ')||'—'),'RIVAL — Equipo faccion: '+(arr(r.faction).join(', ')||'—'),'RIVAL — Equipo universal: '+(arr(r.universal).join(', ')||'—')]:[])],image:s.battlefields?.[t]||null})}
 const blob=makePDF(pages),name='KT-Companion-'+Date.now()+'.pdf';const url=URL.createObjectURL(blob);const aEl=document.createElement('a');aEl.href=url;aEl.download=name;document.body.appendChild(aEl);aEl.click();aEl.remove();setTimeout(()=>URL.revokeObjectURL(url),120000)
}
window.exportPDF=exportPDF;
})();
