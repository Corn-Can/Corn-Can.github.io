/* ----------------- Estella Risk 生成器 ----------------- */
const EASINGS = {
    linear: (t,p=1) => t,
    easeIn: (t,p=2) => Math.pow(t,p),
    easeOut: (t,p=2) => 1 - Math.pow(1 - t, p),
    easeInOut: (t,p=2) => t < 0.5 ? 0.5 * Math.pow(2*t, p) : 1 - 0.5 * Math.pow(2*(1-t), p)
  };
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
  const advArea = document.getElementById('advArea');
  const toggleAdv = document.getElementById('toggleAdv');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const curveCanvas = document.getElementById('curveCanvas');
  const ctx = curveCanvas.getContext('2d');
  
  function drawCurve(curve, marks, bpmSplit){
    const w=curveCanvas.width,h=curveCanvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#04111a"; ctx.fillRect(0,0,w,h);
    ctx.beginPath();
    ctx.strokeStyle="#39a2ff"; ctx.lineWidth=2;
    for(let i=0;i<curve.length;i++){
      const x=i/(curve.length-1||1)*w;
      const y=h-(curve[i]*(h*0.72)+10);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
    ctx.fillStyle="rgba(57,162,255,0.08)"; ctx.fill();
    if(bpmSplit && bpmSplit>0){
      ctx.strokeStyle="rgba(255,255,255,0.04)";
      ctx.lineWidth=1;
      const groups = Math.ceil(curve.length/bpmSplit);
      for(let g=0;g<=groups;g++){
        const x=(g*bpmSplit)/(curve.length)*w;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
      }
    }
    if(Array.isArray(marks)){
      ctx.fillStyle="#ff6b6b";
      for(const m of marks){
        if(m<0||m>=curve.length) continue;
        const x=m/(curve.length-1||1)*w;
        const y=h-(curve[m]*(h*0.72)+10);
        ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
        ctx.fillRect(x-1,h-4,2,4);
      }
    }
  }
  
  function generateAll(){
    const bpmSplit=Math.max(1,parseInt(document.getElementById('bpmSplit').value||1));
    let riskCount=Math.max(0,parseInt(document.getElementById('riskCount').value||0));
    const avoidRaw=(document.getElementById('avoidTracks').value||'').trim();
    const avoidTracks=avoidRaw===''?[]:avoidRaw.split(',').map(s=>parseInt(s)).filter(n=>!isNaN(n)&&n>=1&&n<=8);
    const isHold=document.getElementById('holdCheckbox').checked;
    const holdTxt=(document.getElementById('holdText').value||'').trim();
    const advOn=advArea.style.display==='block';
    const totalCuts=advOn?Math.max(1,parseInt(document.getElementById('advDuration').value||1)):null;
    const easeType=advOn?document.getElementById('easingType').value:'linear';
    const easePower=advOn?clamp(parseFloat(document.getElementById('easingPower').value||2),0.1,4):1;
    const packMode=advOn?document.getElementById('packMode').value:'none';
    const packSize=advOn?Math.max(1,parseInt(document.getElementById('packSize').value||1)):1;
    const packStart=advOn?Math.max(0,parseInt(document.getElementById('packStart').value||1)):1;
    const allTracks=[1,2,3,4,5,6,7,8];
    const usableTracks=allTracks.filter(t=>!avoidTracks.includes(t));
    if(usableTracks.length===0 && riskCount>0){ alert('⚠️ 沒有可用軌道（全部被規避）'); return; }
    let totalSlots,selectedSlots=[],curve=[];
    if(!advOn){
      const rows=Math.ceil(riskCount/bpmSplit)||1;
      totalSlots=rows*bpmSplit;
      for(let i=0;i<Math.min(riskCount,totalSlots);i++) selectedSlots.push(i);
      curve=new Array(totalSlots).fill(0);
      drawCurve(curve,selectedSlots,bpmSplit);
    } else {
      totalSlots=totalCuts;
      const curveArr=[];
      for(let i=0;i<totalSlots;i++){
        const t=totalSlots===1?0:i/(totalSlots-1);
        curveArr.push(clamp(EASINGS[easeType](t,easePower),0,1));
      }
      curve=curveArr.slice();
      if(riskCount>totalSlots) riskCount=totalSlots;
      const sum=curveArr.reduce((a,b)=>a+b,0);
      if(riskCount<=0){ selectedSlots=[]; }
      else if(sum<1e-9){
        for(let k=0;k<riskCount;k++){
          const pos=Math.round(((k+0.5)/riskCount)*totalSlots-0.5);
          selectedSlots.push(clamp(pos,0,totalSlots-1));
        }
      } else {
        const used=new Set();
        for(let k=1;k<=riskCount;k++){
          const y=(k-0.5)/riskCount;
          let bestIdx=-1,bestDiff=Number.POSITIVE_INFINITY;
          for(let i=0;i<totalSlots;i++){
            if(used.has(i)) continue;
            const d=Math.abs(curveArr[i]-y);
            if(d<bestDiff){ bestDiff=d; bestIdx=i; }
          }
          if(bestIdx===-1){ for(let i=0;i<totalSlots;i++){ if(!used.has(i)){ bestIdx=i; break; } } }
          if(bestIdx!==-1){ used.add(bestIdx); selectedSlots.push(bestIdx); }
        }
        selectedSlots.sort((a,b)=>a-b);
      }
      drawCurve(curveArr,selectedSlots,bpmSplit);
    }
    const assignedTrack={};
    if(selectedSlots.length>0 && usableTracks.length>0){
      let cursor=0;
      const rounds=Math.ceil(selectedSlots.length/usableTracks.length);
      for(let r=0;r<rounds;r++){
        const pool=usableTracks.slice();
        shuffle(pool);
        for(let j=0;j<pool.length && cursor<selectedSlots.length;j++){
          assignedTrack[selectedSlots[cursor]]=pool[j];
          cursor++;
        }
      }
    }
    const total=(!advOn)?Math.ceil(riskCount/bpmSplit)*bpmSplit:totalSlots;
    const cells=new Array(total).fill(null).map(()=>[]);
    for(const idx of selectedSlots){
      const track=assignedTrack[idx];
      const tok=isHold && holdTxt?`r${track}${holdTxt}`:`r${track}`;
      cells[idx].push(tok);
    }
    if(packMode==='comma'){
      const groups=Math.ceil(total/packSize);
      for(let g=0;g<groups;g++){
        const startIdx=g*packSize,endIdx=Math.min((g+1)*packSize-1,total-1),gId=packStart+g;
        cells[startIdx].unshift(`(gs${gId})`);
        cells[endIdx].push(`(ge${gId})`);
      }
    } else if(packMode==='risk'){
      const riskIndices=selectedSlots.slice();
      for(let r=0;r<riskIndices.length;r++){
        const g=Math.floor(r/packSize),gId=packStart+g,slotIdx=riskIndices[r];
        if(r%packSize===0) cells[slotIdx].unshift(`(gs${gId})`);
        if(r%packSize===packSize-1 || r===riskIndices.length-1) cells[slotIdx].push(`(ge${gId})`);
      }
    }
    const cellStrings=cells.map(parts=>parts.length?parts.join('/'):'');
    const lines=[];
    for(let i=0;i<cellStrings.length;i+=bpmSplit){
      const slice=cellStrings.slice(i,i+bpmSplit);
      const line=slice.join(',')+','; lines.push(line);
    }
    const header=`{${bpmSplit}}\n`;
    document.getElementById('resultArea').value=header+lines.join('\n');
  }
  
  toggleAdv.addEventListener('click',()=>{
    if(advArea.style.display==='block'){ advArea.style.display='none'; toggleAdv.textContent='開啟進階模式'; }
    else { advArea.style.display='block'; toggleAdv.textContent='關閉進階模式'; }
    generateAll();
  });
  generateBtn.addEventListener('click',generateAll);
  copyBtn.addEventListener('click',()=>{
    const txt=document.getElementById('resultArea').value;
    if(!txt){ alert('結果為空'); return; }
    navigator.clipboard.writeText(txt).then(()=>alert('✅ 已複製'),()=>alert('複製失敗'));
  });
  ['advDuration','easingType','easingPower','packMode','packSize','packStart',
  'bpmSplit','riskCount','avoidTracks','holdCheckbox','holdText'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.addEventListener('input',()=>generateAll());
    el.addEventListener('change',()=>generateAll());
  });
  advArea.style.display='none';
  generateAll();
  /* 你的 EASINGS、drawCurve、generateAll、事件綁定全部保留 */