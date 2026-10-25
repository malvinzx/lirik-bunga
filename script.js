(()=>{
const D=window.CONFIG,KEY='lirik-bunga-v3';
let C={...D};try{Object.assign(C,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const $=s=>document.querySelector(s),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(Object.fromEntries(FIELDS.map(f=>[f[0],C[f[0]]]))))}catch(e){}};
const rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const easeOut=t=>1-Math.pow(1-t,3),back=t=>1+2.7*Math.pow(t-1,3)+1.7*Math.pow(t-1,2);

/* ---------- Taman bunga (canvas) ---------- */
const cv=$('#garden'),g=cv.getContext('2d');let DPR=1;
const size=()=>{DPR=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*DPR;cv.height=innerHeight*DPR};
addEventListener('resize',size);size();
const PAL=[['#ff8fb8','#ffd3e3','#fff2f6'],['#ff7f8f','#ffc0c6','#fff0f1'],['#f6c06a','#ffe3a8','#fff7e0'],['#b49bff','#dcd0ff','#f4f0ff'],['#ff9ec0','#ffe0ea','#ffffff']];
const things=[],bits=[];

function head(x,y,s,o,rot,pal,L,n){
  g.save();g.translate(x,y);g.rotate(rot);
  for(let l=0;l<L;l++){
    const len=s*(1-l*.24)*o,wd=len*(.34+l*.06),off=l*Math.PI/n+(1-clamp(o))*(l+1)*1.1;
    g.fillStyle=pal[l%3];
    for(let k=0;k<n;k++){
      g.save();g.rotate(k/n*6.2832+off);g.beginPath();g.moveTo(0,0);
      g.bezierCurveTo(wd,-len*.2,wd*1.05,-len*.9,0,-len);g.bezierCurveTo(-wd*1.05,-len*.9,-wd,-len*.2,0,0);g.fill();g.restore();
    }
  }
  g.fillStyle='#ffcf6e';g.beginPath();g.arc(0,0,Math.max(0,s*.1*o),0,6.2832);g.fill();g.restore();
}
function shed(x,y,pal,n){if(bits.length>40)return;for(let i=0;i<n;i++)bits.push({x,y,vx:rand(-.05,.05),vy:rand(-.09,-.01),r:rand(4,8),rot:rand(0,6.28),vr:rand(-.004,.004),c:pick(pal),life:rand(3200,5200),age:0,ph:rand(0,6.28)})}

class Stem{
  constructor(x,h){this.x=x;this.h=h;this.age=0;this.pal=pick(PAL);this.ph=rand(0,6.28);this.bend=rand(-70,70);this.s=rand(26,46);
    this.life=rand(11000,19000);this.n=pick([7,9,11]);this.L=pick([2,3]);this.rot=rand(0,6.28);this.a=1;this.pop=false}
  p(u,t){const H=innerHeight,sw=reduce?0:Math.sin(t*.0011+this.ph)*14*u*u,v=1-u,
    x1=this.x+this.bend,y1=H-this.h*.55,x2=this.x+this.bend*.35+sw,y2=H-this.h;
    return[v*v*this.x+2*v*u*x1+u*u*x2,v*v*(H+4)+2*v*u*y1+u*u*y2]}
  step(dt){this.age+=dt;if(this.age>this.life)this.a=clamp(1-(this.age-this.life)/2200);return this.a>0}
  draw(t){
    const gr=easeOut(clamp(this.age/2600)),b=clamp((this.age-2000)/1800);
    g.globalAlpha=this.a;g.strokeStyle='#5aa882';g.lineWidth=2.4;g.lineCap='round';g.beginPath();
    for(let i=0;i<=28;i++){const[x,y]=this.p(gr*i/28,t);i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
    g.fillStyle='#4f9a74';
    for(const u of[.32,.55]){const k=clamp((gr-u)*5);if(k>0){const[x,y]=this.p(u,t),d=u<.4?-1:1;
      g.save();g.translate(x,y);g.rotate(d*.9);g.beginPath();g.ellipse(9*k*d,0,14*k,5*k,0,0,6.2832);g.fill();g.restore()}}
    if(b>0){const[x,y]=this.p(gr,t);
      head(x,y,this.s,back(b),this.rot+(reduce?0:Math.sin(t*.0009+this.ph)*.15)+b*.6,this.pal,this.L,this.n);
      if(!this.pop&&b>.9){this.pop=true;shed(x,y,this.pal,3)}}
    g.globalAlpha=1;
  }
}
class Bloom{
  constructor(x,y){this.x=x;this.y=y;this.age=0;this.pal=pick(PAL);this.s=rand(16,32);this.life=rand(3000,4200);
    this.n=pick([6,8,10]);this.L=pick([2,3]);this.rot=rand(0,6.28);this.a=1;shed(x,y,this.pal,2)}
  step(dt){this.age+=dt;this.y-=dt*.006;this.rot+=dt*.0004;this.a=clamp((this.life-this.age)/1400);return this.a>0}
  draw(){g.globalAlpha=this.a;head(this.x,this.y,this.s,back(clamp(this.age/1300)),this.rot,this.pal,this.L,this.n);g.globalAlpha=1}
}
const spawnStem=(x,h)=>things.push(new Stem(x??rand(.04,.96)*innerWidth,h??rand(.2,.55)*innerHeight));
const bloom=(x,y)=>{if(things.filter(o=>o instanceof Bloom).length<6)things.push(new Bloom(x,y))};
cv.addEventListener('pointerdown',e=>spawnStem(e.clientX,Math.max(90,innerHeight-e.clientY)));
for(let i=0;i<2;i++)setTimeout(spawnStem,i*900);

let last=performance.now(),acc=0;
function frame(now){
  const dt=Math.min(50,now-last);last=now;
  if(!document.hidden){
    const dens=C.flowerDensity*(reduce?.4:1);acc+=dt;
    if(dens>0&&acc>2800/dens&&things.filter(o=>o instanceof Stem).length<Math.round(3+5*dens)){acc=0;spawnStem()}
    g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,innerWidth,innerHeight);
    for(let i=things.length-1;i>=0;i--){const o=things[i];o.step(dt)?o.draw(now):things.splice(i,1)}
    for(let i=bits.length-1;i>=0;i--){const b=bits[i];b.age+=dt;
      if(b.age>b.life){bits.splice(i,1);continue}
      b.vy=Math.min(.05,b.vy+.00004*dt);b.x+=b.vx*dt+Math.sin(b.age*.002+b.ph)*.03*dt;b.y+=b.vy*dt;b.rot+=b.vr*dt;
      g.globalAlpha=clamp(1-b.age/b.life)*.9;g.fillStyle=b.c;g.save();g.translate(b.x,b.y);g.rotate(b.rot);
      g.beginPath();g.ellipse(0,0,b.r,b.r*.55,0,0,6.2832);g.fill();g.restore()}
    g.globalAlpha=1;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Sinkronisasi lirik (LRC) ---------- */
const stage=$('#stage'),au=$('#au'),seekEl=$('#seek');
let cues=[],meta={},len=0,cur=null,lineEl=null,shown=-2,paused=true,useAudio=false,ownT=0,lt=performance.now();
const fmt=ms=>{const s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function parseLRC(txt){
  meta={};cues=[];
  for(const raw of txt.split(/\r?\n/)){
    const m=raw.match(/^\s*((?:\[\d+:\d+(?:\.\d+)?\])+)(.*)$/);
    if(m){const text=m[2].replace(/<[^>]*>/g,'').trim();
      for(const t of m[1].match(/\[[^\]]+\]/g)){const[a,b]=t.slice(1,-1).split(':');cues.push({t:(+a*60+ +b)*1000,text})}}
    else{const k=raw.match(/^\s*\[(\w+):\s*(.*?)\s*\]/);if(k)meta[k[1].toLowerCase()]=k[2]}
  }
  cues.sort((a,b)=>a.t-b.t);
}
function loaded(){
  const m=(meta.length||'').match(/(\d+):(\d+)/);
  len=m?(+m[1]*60+ +m[2])*1000:(cues.length?cues[cues.length-1].t+4000:0);
  $('#title').textContent=C.title||meta.ti||'';$('#artist').textContent=meta.ar||'';seek(0);
}
const now=()=>useAudio?au.currentTime*1000:ownT;
const dropAudio=()=>{if(useAudio){ownT=au.currentTime*1000;useAudio=false}};
au.addEventListener('error',dropAudio);
au.addEventListener('ended',()=>{setPaused(true);seek(0)});
if(C.audio){useAudio=true;au.src=C.audio}
function setPaused(p){
  paused=p;$('#bPlay').textContent=p?'Putar':'Jeda';if(!p)document.body.classList.add('go');
  if(useAudio){p?au.pause():au.play().catch(dropAudio)}
}
function seek(ms){ms=clamp(ms,0,len||1e9);ownT=ms;if(useAudio&&au.readyState>0)au.currentTime=ms/1000;shown=-2}
const burst=()=>{const n=Math.round(2+2*C.flowerDensity);if(C.flowerDensity>0&&!paused)for(let i=0;i<n;i++)setTimeout(spawnStem,i*650)};
function enter(i){
  shown=i;const old=lineEl;lineEl=null;
  if(old){old.classList.add('out');setTimeout(()=>old.remove(),1300)}
  cur=cues[i];if(!cur)return;
  if(!cur.text){burst();return}
  const el=document.createElement('div');el.className='line';
  el._w=cur.text.split(/\s+/).map((w,k)=>{const s=document.createElement('span');s.className='w';s.textContent=w;s.style.setProperty('--i',k);el.appendChild(s);return s});
  const nx=cues[i+1],dur=Math.min(nx?nx.t-cur.t:6000,9000);
  el._n=0;el._step=Math.max(60,Math.min(C.wordDelay,dur*.7/el._w.length));
  stage.appendChild(el);lineEl=el;
}
function tick(n){
  const dt=Math.min(100,n-lt);lt=n;if(!paused&&!useAudio)ownT+=dt;
  const t=now()+(+C.syncOffset||0),total=(useAudio&&isFinite(au.duration)&&au.duration*1000)||len;
  let i=-1;for(let k=cues.length-1;k>=0;k--)if(cues[k].t<=t){i=k;break}
  if(i!==shown)enter(i);
  if(lineEl){const e=t-cur.t;
    while(lineEl._n<lineEl._w.length&&lineEl._n*lineEl._step<=e){
      const k=lineEl._n++,s=lineEl._w[k],r=s.getBoundingClientRect();s.classList.add('on');
      if(C.bloomEvery&&k%C.bloomEvery===0&&e-k*lineEl._step<500)bloom(r.left+r.width/2,r.bottom)}}
  seekEl.max=total;if(!seekEl.matches(':active'))seekEl.value=Math.min(t,total);
  $('#tNow').textContent=fmt(Math.min(t,total));$('#tAll').textContent=fmt(total);
  if(!paused&&!useAudio&&len&&ownT>len+800){setPaused(true);seek(0)}
  requestAnimationFrame(tick);
}

/* ---------- Panel pengaturan ---------- */
const FIELDS=[['syncOffset','Geser waktu lirik (ms)',-2000,2000,50],['wordDelay','Jeda antar kata, maksimal (ms)',0,1500,10],
['wordDuration','Durasi animasi kata (ms)',150,3000,50],['bloomEvery','Bunga tiap n kata (0 = mati)',0,5,1],
['flowerDensity','Kepadatan bunga',0,3,.1],['fontSize','Ukuran teks',.6,1.6,.05]];
function apply(){const r=document.documentElement.style;r.setProperty('--dur',C.wordDuration+'ms');r.setProperty('--fs',C.fontSize)}
function build(){
  const box=$('#fields');box.innerHTML='';
  for(const[k,l,mn,mx,st]of FIELDS){
    const w=document.createElement('label');w.innerHTML=`<span>${l}</span><output></output><input type="range" min="${mn}" max="${mx}" step="${st}">`;
    const i=w.querySelector('input'),o=w.querySelector('output');i.value=C[k]||0;o.textContent=C[k]||0;
    i.oninput=()=>{C[k]=+i.value;o.textContent=C[k];apply();save()};box.appendChild(w);
  }
}
const panel=$('#panel'),togglePanel=()=>{const o=panel.classList.toggle('open');panel.setAttribute('aria-hidden',!o)};
$('#bSet').onclick=togglePanel;$('#bStart').onclick=()=>setPaused(false);$('#bPlay').onclick=()=>setPaused(!paused);
$('#bRe').onclick=()=>{seek(0);setPaused(false)};
seekEl.oninput=()=>seek(+seekEl.value-(+C.syncOffset||0));
$('#fLrc').onchange=async e=>{const f=e.target.files[0];if(f){parseLRC(await f.text());loaded()}};
$('#fAu').onchange=e=>{const f=e.target.files[0];if(f){useAudio=true;au.src=URL.createObjectURL(f);au.load();seek(0)}};
$('#bReset').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}C={...D};build();apply()};
addEventListener('keydown',e=>{
  if(/TEXTAREA|INPUT/.test(e.target.tagName))return;
  if(e.code==='Space'&&e.target===document.body){e.preventDefault();setPaused(!paused)}
  if(e.key==='ArrowRight')seek(now()+5000);if(e.key==='ArrowLeft')seek(now()-5000);
  if(e.key==='s'||e.key==='S')togglePanel();
});
setTimeout(()=>$('#hint').classList.add('hide'),7000);
parseLRC(window.LRC_TEXT||'');apply();build();loaded();requestAnimationFrame(tick);
})();
