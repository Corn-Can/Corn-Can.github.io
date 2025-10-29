/* ----------------- 譜面翻轉工具 ----------------- */
function flipToken(token, mode, angle){
    if(token.trim() === '') return token;

    const parts = token.split('/');

    const flippedParts = parts.map(p => {
        // 拆括號
        const bracketMatch = p.match(/^(.*?)(\[.*\]|\(.*\))?$/);
        if(!bracketMatch) return p;

        let core = bracketMatch[1];   // l4
        const bracket = bracketMatch[2] || ''; // [14:8]

        const re = /^((?:cl|[clr])?)(\d{1,2})([a-z]{0,2})?$/i;
        const m = core.match(re);
        if(!m) return p;

        let [_, pre, numStr, suf] = m;
        let num = parseInt(numStr);
        suf = suf || '';
        let step = 0;

        if(mode === '8'){
            if(suf.toLowerCase() === 'cs'){
                step = Math.round(angle/45)*2;
                num = ((num-1 + step + 16)%16)+1;
            } else {
                step = Math.round(angle/45);
                if(num === 0) return p;
                num = ((num-1 + step + 8)%8)+1;
            }
        } else if(mode === '16'){
            if(!suf.toLowerCase().includes('cs') || num === 0) return p;
            step = Math.round(angle/22.5);
            num = ((num-1 + step + 16)%16)+1;
        }

        return `${pre}${num}${suf}${bracket}`;
    });

    return flippedParts.join('/');
}

function flipLine(line,mode,angle){
  const tokens=line.split(/(,)/);
  return tokens.map(t=>t===','? t : flipToken(t,mode,angle)).join('');
}

document.getElementById('flipBtn').addEventListener('click',()=>{
  const angle=parseFloat(document.getElementById('flipAngle').value||0);
  const mode=document.getElementById('flipMode').value;
  const input=document.getElementById('flipInput').value;
  const lines=input.split('\n');
  const result=lines.map(l=>flipLine(l,mode,angle)).join('\n');
  document.getElementById('flipResult').value=result;
});
document.getElementById('flipCopy').addEventListener('click',()=>{
  const txt=document.getElementById('flipResult').value;
  if(!txt){ alert('結果為空'); return; }
  navigator.clipboard.writeText(txt).then(()=>alert('✅ 已複製'),()=>alert('複製失敗'));
});
// 這樣翻轉功能保持完整