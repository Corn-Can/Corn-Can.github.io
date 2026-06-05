/* ----------------- 批量群組初始化工具 ----------------- */

function generateGroupInit() {
    const startID = parseInt(document.getElementById('giStart').value);
    const endID = parseInt(document.getElementById('giEnd').value);
    const cmdStr = document.getElementById('giCmds').value;

    if (isNaN(startID) || isNaN(endID) || startID > endID) {
        alert("請確認起始與結束 ID 的數值是否正確！(起始必須小於或等於結束)");
        return;
    }

    if (!cmdStr.trim()) {
        alert("請輸入至少一個初始化指令！(例如 s1)");
        return;
    }

    // 解析使用者輸入的指令 (支援 s1, r0, d0.5 這種逗號分隔寫法)
    const cmds = cmdStr.split(',').map(cmd => cmd.trim()).filter(cmd => cmd !== '');
    let resultParts = [];

    // 遍歷所有指定的群組 ID
    for (let i = startID; i <= endID; i++) {
        // 對於每一個群組，套用所有指令
        cmds.forEach(cmd => {
            // 清理可能誤打的括號，確保後續包裝正確
            let cleanCmd = cmd.replace(/[()]/g, '');
            resultParts.push(`(${cleanCmd}?${i})`);
        });
    }

    // 將所有指令用斜線 / 串接，並在結尾補上逗號
    const finalOutput = resultParts.join('/') + ',';
    
    document.getElementById('giOutput').value = finalOutput;
}

// 綁定生成按鈕
const giGenerateBtn = document.getElementById('giGenerateBtn');
if (giGenerateBtn) {
    giGenerateBtn.addEventListener('click', generateGroupInit);
}

// 綁定複製按鈕
const giCopyBtn = document.getElementById('giCopyBtn');
if (giCopyBtn) {
    giCopyBtn.addEventListener('click', () => {
        const txt = document.getElementById('giOutput').value;
        if (!txt) return alert('結果為空！');
        navigator.clipboard.writeText(txt).then(() => alert('✅ 已複製初始化代碼'));
    });
}