const FIMG={};Object.entries(FLAGS).forEach(([k,v])=>{const i=new Image();i.onload=()=>charts.cNaz&&charts.cNaz.draw();i.src=v;FIMG[k]=i});
DATA.forEach((d,i)=>d.i=i);
const $=id=>document.getElementById(id);
const dec=y=>Math.floor(y/10)*10;
const cnt=(arr,f)=>{const m=new Map();arr.forEach(x=>{const k=f(x);m.set(k,(m.get(k)||0)+1)});return m};
const topN=(m,n)=>[...m].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]))).slice(0,n);
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PAL=['#b388ff','#5eead4','#ff8a65','#ffd54f','#64b5f6','#f06292','#aed581','#ba68c8','#4dd0e1','#ffb74d','#90a4ae','#e57373'];
const genOrder=topN(cnt(DATA,d=>d.g),99).map(x=>x[0]);
const hue=g=>{const i=genOrder.indexOf(g);return Math.round((i*47+265)%360)};

// filtri
for(const [id,vals] of [['fg',genOrder],['fn',topN(cnt(DATA,d=>d.n),99).map(x=>x[0])]]){
  vals.forEach(v=>$(id).insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
}
[...new Set(DATA.map(d=>dec(d.y)))].sort((a,b)=>b-a).forEach(d=>$('fd').insertAdjacentHTML('beforeend',`<option value="${d}">Anni ${d}</option>`));

let PAGE=48, shown=PAGE, cur=[];
function filtered(){
  const q=$('q').value.trim().toLowerCase(),g=$('fg').value,n=$('fn').value,d=$('fd').value,v=$('fv').checked;
  let r=DATA.filter(x=>(!q||x.t.toLowerCase().includes(q)||x.a.toLowerCase().includes(q))&&(!g||x.g===g)&&(!n||x.n===n)&&(!d||dec(x.y)==d)&&(!v||x.v!=null));
  const s=$('so').value;
  const nv=(x,dir)=>x.v==null?(dir>0?-1:99):x.v;
  const cmp={yd:(a,b)=>b.y-a.y||a.i-b.i,ya:(a,b)=>a.y-b.y||a.i-b.i,
    vd:(a,b)=>(b.v??-1)-(a.v??-1)||b.y-a.y, va:(a,b)=>(a.v??99)-(b.v??99)||b.y-a.y,
    ta:(a,b)=>a.t.localeCompare(b.t,'it'),aa:(a,b)=>a.a.localeCompare(b.a,'it')||a.y-b.y,o:(a,b)=>a.i-b.i}[s];
  return r.sort(cmp);
}
function card(x){
  const rate=x.v!=null?`<span class="rate">★ ${x.v.toFixed(1).replace(/\.0$/,'')}</span>`:`<span class="rate none">n.d.</span>`;
  return `<article class="card" style="--h:${hue(x.g)}"><div class="cover">${rate}<div class="yr">${x.y}</div><span class="tag">${esc(x.g)}</span></div>
  <div class="info"><h4>${esc(x.t)}</h4><p>${esc(x.a)}</p><div class="meta"><span class="fl" title="${esc(x.n)}"><img src="${FLAGS[x.n]}" alt="${esc(x.n)}" loading="lazy"></span><span>Anni ${dec(x.y)}</span></div></div></article>`;
}
function renderGrid(){
  const g=$('grid');
  g.innerHTML=cur.length?cur.slice(0,shown).map(card).join(''):'<div class="empty">Nessun album trovato. Prova ad allentare i filtri.</div>';
  $('more').style.display=shown<cur.length?'block':'none';
  $('more').textContent=`Mostra altri (${Math.min(PAGE,cur.length-shown)})`;
  $('count').textContent=`${cur.length} album${cur.length===DATA.length?'':' su '+DATA.length}`;
}
function kpis(r){
  const rated=r.filter(x=>x.v!=null), avg=rated.length?rated.reduce((s,x)=>s+x.v,0)/rated.length:null;
  const ag=topN(cnt(r,x=>x.g),1)[0], best=[...rated].sort((a,b)=>b.v-a.v)[0];
  $('kpis').innerHTML=`
   <div class="kpi"><b>${r.length}</b><small>album</small></div>
   <div class="kpi"><b>${new Set(r.map(x=>x.a)).size}</b><small>artisti</small></div>
   <div class="kpi"><b>${new Set(r.map(x=>x.n)).size}</b><small>nazioni</small></div>
   <div class="kpi"><b>${avg?avg.toFixed(2):'-'}</b><small>voto medio (${rated.length} votati)</small></div>
   <div class="kpi"><b class="sm">${ag?esc(ag[0]):'-'}</b><small>genere più ascoltato</small></div>
   <div class="kpi"><b class="sm">${best?esc(best.t):'-'}</b><small>voto più alto · ${best?best.v:''}</small></div>`;
}

// grafici
Chart.defaults.color='#8b8aa0';Chart.defaults.font.family='Inter';Chart.defaults.borderColor='#262634';
const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#0b0b10',borderColor:'#262634',borderWidth:1,padding:10,titleColor:'#ecebf3',bodyColor:'#ecebf3'}},animation:{duration:350}};
const charts={};
function mk(id,type,opts){charts[id]=new Chart($(id),{type,data:{labels:[],datasets:[{data:[]}]},options:opts});}
const hbar=(extra={})=>({...base,indexAxis:'y',scales:{x:{grid:{color:'#1d1d29'},ticks:{precision:0}},y:{grid:{display:false}}},...extra});
mk('cGen','bar',{...hbar(),layout:{padding:{right:26}},scales:{x:{display:false,grid:{display:false}},y:{grid:{display:false},ticks:{autoSkip:false,font:{size:11.5},color:'#c9c8d8'}}},plugins:{...base.plugins,valueLabels:true}});
charts.cGen.config.plugins=[{id:'vl',afterDatasetsDraw(c){const m=c.getDatasetMeta(0),ctx=c.ctx;ctx.save();ctx.fillStyle='#ecebf3';ctx.font='500 11px Inter';ctx.textBaseline='middle';m.data.forEach((b,i)=>ctx.fillText(c.data.datasets[0].data[i],b.x+6,b.y));ctx.restore()}}];
charts.cGen.destroy();charts.cGen=new Chart($('cGen'),{type:'bar',data:{labels:[],datasets:[{data:[]}]},options:{...hbar(),layout:{padding:{right:28}},scales:{x:{display:false,grid:{display:false}},y:{grid:{display:false},ticks:{autoSkip:false,font:{size:11.5},color:'#c9c8d8'}}}},plugins:[{id:'vl',afterDatasetsDraw(c){const m=c.getDatasetMeta(0),ctx=c.ctx;ctx.save();ctx.fillStyle='#ecebf3';ctx.font='500 11px Inter';ctx.textBaseline='middle';m.data.forEach((b,i)=>ctx.fillText(c.data.datasets[0].data[i],b.x+6,b.y));ctx.restore()}}]});
mk('cYear','bar',{...base,scales:{x:{grid:{display:false},ticks:{maxTicksLimit:14}},y:{grid:{color:'#1d1d29'},ticks:{precision:0}}}});
mk('cDec','bar',{...base,scales:{x:{grid:{display:false}},y:{grid:{color:'#1d1d29'},ticks:{precision:0}}}});
mk('cNaz','bar',{...hbar(),layout:{padding:{left:6}},scales:{x:{grid:{color:'#1d1d29'},ticks:{precision:0}},y:{grid:{display:false},ticks:{display:false}}}});
charts.cNaz.config.plugins=[{id:'flags',afterDatasetsDraw(c){const y=c.scales.y,ctx=c.ctx;c.data.labels.forEach((l,i)=>{const im=FIMG[l];if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,c.chartArea.left-34,y.getPixelForTick(i)-9,25,19)})}}];
charts.cNaz.destroy();charts.cNaz=new Chart($('cNaz'),{type:'bar',data:{labels:[],datasets:[{data:[]}]},options:{...hbar(),layout:{padding:{left:34}},scales:{x:{grid:{color:'#1d1d29'},ticks:{precision:0}},y:{grid:{display:false},ticks:{display:false}}}},plugins:[{id:'flags',afterDatasetsDraw(c){const y=c.scales.y,ctx=c.ctx;c.data.labels.forEach((l,i)=>{const im=FIMG[l];if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,c.chartArea.left-32,y.getPixelForTick(i)-9,25,19)})}}]});
mk('cVal','bar',{...base,scales:{x:{grid:{display:false}},y:{grid:{color:'#1d1d29'},ticks:{precision:0}}}});
mk('cArt','bar',{...base,scales:{x:{grid:{display:false},ticks:{autoSkip:false,maxRotation:40,minRotation:0,font:{size:11}}},y:{grid:{color:'#1d1d29'},ticks:{precision:0}}}});
function setC(id,labels,vals,colors,extra={}){
  const c=charts[id];c.data.labels=labels;
  c.data.datasets=[{data:vals,backgroundColor:colors,borderWidth:0,borderRadius:id==='cGen'?0:5,...extra}];c.update();
}
function charts_(r){
  const g=topN(cnt(r,x=>x.g),99);
  setC('cGen',g.map(x=>x[0]),g.map(x=>x[1]),g.map(x=>`hsl(${hue(x[0])} 70% 62%)`));
  $('genN').textContent='· '+g.length;
  const ym=cnt(r,x=>x.y);let ys=[...ym.keys()];
  if(ys.length){const a=Math.min(...ys),b=Math.max(...ys);ys=[];for(let y=a;y<=b;y++)ys.push(y);}
  setC('cYear',ys,ys.map(y=>ym.get(y)||0),'#b388ff');
  const dm=cnt(r,x=>dec(x.y)),ds=[...dm.keys()].sort();
  setC('cDec',ds.map(d=>d+'s'),ds.map(d=>dm.get(d)),'#5eead4');
  const n=topN(cnt(r,x=>x.n),8);
  setC('cNaz',n.map(x=>x[0]),n.map(x=>x[1]),'#ff8a65');
  const b=Array(8).fill(0),bl=['≤4','4–5','5–6','6–7','7–8','8–9','9+','—'].slice(0,7);
  const B=Array(7).fill(0);
  r.forEach(x=>{if(x.v==null)return;B[x.v<4?0:x.v<5?1:x.v<6?2:x.v<7?3:x.v<8?4:x.v<9?5:6]++});
  setC('cVal',bl,B,['#e57373','#ff8a65','#ffb74d','#ffd54f','#aed581','#5eead4','#64b5f6']);
  const a=topN(cnt(r,x=>x.a),14);
  setC('cArt',a.map(x=>x[0]),a.map(x=>x[1]),'#ffd54f');
}
function update(){
  cur=filtered();shown=PAGE;renderGrid();kpis(cur);charts_(cur);
  const active=$('q').value||$('fg').value||$('fn').value||$('fd').value||$('fv').checked;
  $('scope').textContent=active?`sui ${cur.length} album filtrati`:'sull\'intera collezione';
}
['q','fg','fn','fd','so','fv'].forEach(id=>$(id).addEventListener(id==='q'?'input':'change',update));
$('rs').onclick=()=>{$('q').value='';$('fg').value=$('fn').value=$('fd').value='';$('fv').checked=false;$('so').value='yd';update()};
$('more').onclick=()=>{shown+=PAGE;renderGrid()};
update();
