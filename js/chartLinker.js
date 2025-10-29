/* ----------------- 譜面合併工具 (v2 - 支援雙模式) ----------------- */
function gcd(a,b){return b===0?a:gcd(b,a%b);}
function lcm(a,b){return a/gcd(a,b)*b;}

const inputsElLink=document.getElementById('inputsLink'); // 修正 ID
const errElLink=document.getElementById('errLink'); // 修正 ID
const outputElLink=document.getElementById('outputLink'); // 修正 ID

function createMergeInput(content=''){ // 為了與其他模組名稱區分，改名為 createMergeInput
 const row=document.createElement('div');
 row.className='input-row';
 const ta=document.createElement('textarea');
 ta.className='input';
 ta.placeholder="貼上一段譜面（支援多行與 {N} 繼承）";
 ta.value=content;
 const del=document.createElement('button');
 del.textContent='刪除';
 del.style.marginLeft='8px';
 del.onclick=()=>inputsElLink.removeChild(row);
  // 在新框架中，textarea 和刪除按鈕會並排，所以把按鈕放在容器內
 row.appendChild(ta);
 row.appendChild(del);
 inputsElLink.appendChild(row);
}

// 初始化輸入框
createMergeInput();
createMergeInput();

// 綁定事件（使用新的 ID）
document.getElementById('addMergeInputBtn').onclick=()=>createMergeInput();
document.getElementById('copyMergeResultBtn').onclick=()=>{
 navigator.clipboard.writeText(outputElLink.textContent).then(()=>alert('✅ 已複製到剪貼簿'));
};

document.getElementById('mergeBtnLink').onclick=()=>{
 try { 
  errElLink.style.display='none';errElLink.textContent='';outputElLink.textContent='';
  const texts=Array.from(document.querySelectorAll('#inputsLink .input')).map(t=>t.value.trim()).filter(s=>s.length>0);
  if(texts.length<1){errElLink.style.display='block';errElLink.textContent='請至少輸入一段譜面。';return;}

  // --- ★ 檢查模式 ★ ---
  const allHaveN = texts.every(t => t.trim().startsWith('{'));
  const noneHaveN = texts.every(t => !t.trim().startsWith('{'));

  if (allHaveN) {
    // --- 模式 1：LCM 比例合併 (你現有的邏輯) ---
    runLcmMerge(texts);
  } else if (noneHaveN) {
    // --- 模式 2：直接合併 (檢查逗號數) ---
    runDirectMerge(texts);
  } else {
    // --- 模式 3：混用錯誤 ---
    throw new Error("模式混用：請確保所有欄位都以 {N} 開頭，或所有欄位都不以 {N} 開頭。");
  }
  
 } catch (e) {
  errElLink.style.display = 'block';
  errElLink.textContent = '❌ 處理時發生錯誤：' + e.message;
 }
};


/**
 * 模式 1：LCM 比例合併 (你原有的函式)
 */
function runLcmMerge(texts) {
  // 每一欄 → 多行解析
  const parsedCols=texts.map((raw,idx)=>{
   const lines=raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
   const result=[];
   let currentN=null; // 【重點1】{N} 繼承
   for(let line of lines){
    const match=line.match(/^\{(\d+)\}$/);
    if(match){
     currentN=parseInt(match[1]);
     continue;
    }
    if(currentN==null){throw new Error(`(LCM模式) 第 ${idx+1} 欄的內容缺少 {N} 定義`);}
    
    // 【重點2】以「逗號數量」決定該行使用的欄位數 (slots)
    const consumedSlots = (line.match(/,/g) || []).length;
    
    const parts = line.split(',', consumedSlots); 
    const proportion = consumedSlots / currentN; // 計算比例
    
    result.push({N: currentN, parts, consumedSlots, proportion});
   }
   return result;
  });

  // 找最大行數
  const maxLines=Math.max(...parsedCols.map(c=>c.length));
  if (maxLines === 0) {
   throw new Error("所有輸入欄位都只定義了 {N}，沒有譜面內容。");
  }

  let outputLines=[];
  let currentTotalLCM = null; // 用於追蹤 {N} 是否變更

  // 迴圈處理「每一行」輸入
  for(let i=0;i<maxLines;i++){
   // 若不足則沿用最後一行
   const rowSet=parsedCols.map(col=>col[i]||col[col.length-1]); 
   
   if(!rowSet.every(r=>r && r.N)){
    throw new Error(`(LCM模式) 第 ${i+1} 行有欄位缺少 {N} (內部錯誤)`);
   }
   
   // 【重點3】檢查所有欄位的「比例」是否一致
   const firstProp = rowSet[0].proportion;
   if (!rowSet.every(r => Math.abs(r.proportion - firstProp) < 1e-9)) {
    throw new Error(`(LCM模式) 第 ${i + 1} 行的各欄位比例不一致 (例如 1/2 和 1/3)。請檢查各欄的「逗號數量」。`);
   }
   
   if (firstProp < 1e-9 && rowSet.every(r => r.consumedSlots === 0)) {
    continue;
   }
   
   // 計算 LCM
   let totalLCM=rowSet[0].N;
   for(let j=1;j<rowSet.length;j++) totalLCM=lcm(totalLCM,rowSet[j].N);
   
   // 只有在 LCM 變更時才輸出 {N}
   if (totalLCM !== currentTotalLCM) {
    outputLines.push(`{${totalLCM}}`);
    currentTotalLCM = totalLCM;
   }

   // 擴展每欄到 totalLCM
   const expanded=rowSet.map(r=>{
    const ratio=totalLCM/r.N;
    const arr=Array(totalLCM).fill('');
    for(let j=0;j<r.N;j++){
     arr[j*ratio]=r.parts[j]||'';
    }
    return arr;
   });

   // 【重點4】比例合併與換行
   const lineBuf=[];
   const outputSlots = Math.round(totalLCM * firstProp);
   
   // 迴圈只跑到 outputSlots (該行應有的長度)
   for(let t=0;t<outputSlots;t++){
    const parts=[];
    for(let k=0;k<expanded.length;k++){
     const v=expanded[k][t];
     if(v) parts.push(v); // 只合併非空字串
    }
    lineBuf.push(parts.join('/'));
   }
   
   outputLines.push(lineBuf.join(',') + ',');
  } 

  outputElLink.textContent = outputLines.join('\n');
}

/**
 * 模式 2：直接合併 (檢查逗號數)
 */
function runDirectMerge(texts) {
  // 每一欄 → 多行解析 (不關心 {N})
  const parsedCols = texts.map((raw, idx) => {
    const lines = raw.split(/\r?\n/); // 保留空行以便對齊
    const result = [];
    for (let line of lines) {
        const lineContent = line; // 保留 trim() 嗎？先不trim，保留原始對齊
        const consumedSlots = (lineContent.match(/,/g) || []).length;
        const parts = lineContent.split(',', consumedSlots);
        result.push({ parts, consumedSlots });
    }
    return result;
  });

  // 找最大行數
  const maxLines = Math.max(...parsedCols.map(c => c.length));
  let outputLines = [];

  for (let i = 0; i < maxLines; i++) {
    // 獲取該行的所有欄位，如果某欄較短，則使用空物件
    const rowSet = parsedCols.map(col => col[i] || { parts: [''], consumedSlots: 0 }); 

    // 檢查是否所有欄位都是空行
    const isAllEmpty = rowSet.every(r => r.consumedSlots === 0 && (r.parts.length === 0 || r.parts[0] === ''));
    if (i > 0 && isAllEmpty) {
        outputLines.push(''); // 保留空行
        continue;
    }

    // ★ 檢查逗號數是否一致 ★
    const firstCommaCount = rowSet[0].consumedSlots;
    const isConsistent = rowSet.every(r => r.consumedSlots === firstCommaCount);

    if (!isConsistent) {
        throw new Error(`(直接合併模式) 第 ${i + 1} 行的逗號數量 (切分總數) 不一致。`);
    }

    // 如果是第一行，且為空，則跳過 (避免為空的 textarea 產生一行 ',')
    if (i === 0 && isAllEmpty) {
      continue;
    }

    const lineBuf = [];
    const totalSlots = firstCommaCount;

    for (let t = 0; t < totalSlots; t++) {
        const parts = [];
        for (let k = 0; k < rowSet.length; k++) {
            const v = (rowSet[k].parts[t] || '').trim(); // 合併時才 trim
            if (v) parts.push(v);
        }
        lineBuf.push(parts.join('/'));
    }
    outputLines.push(lineBuf.join(',') + ',');
  }
  
  outputElLink.textContent = outputLines.join('\n');
}