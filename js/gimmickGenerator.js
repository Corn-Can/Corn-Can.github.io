/* ----------------- 特效/演出產生器 ----------------- */

const gimmickModule = document.getElementById('gimmickModule');

if (gimmickModule) {
    const typeSelect = document.getElementById('gimmickType');
    const modeSelect = document.getElementById('gimmickMode');
    const valueInput = document.getElementById('gimmickValue');
    const durationInput = document.getElementById('gimmickDuration');
    const easingInput = document.getElementById('gimmickEasing');
    const generateBtn = document.getElementById('gimmickGenerateBtn');
    const copyBtn = document.getElementById('gimmickCopyBtn');
    const outputInput = document.getElementById('gimmickOutput');

    function generateGimmick() {
        const type = typeSelect.value;
        const mode = modeSelect.value; // '~' or ''
        const value = valueInput.value;
        const duration = durationInput.value;
        const easing = easingInput.value;

        if (value === '') {
            outputInput.value = '';
            return;
        }

        let result = `(${type}${mode}${value}`;

        if (duration || easing) {
            result += `:${duration || '0'}`;
        }
        if (easing) {
            // According to your spec, easing is the second param after ':'
            // But the example (r~-9:3) only has one. Let's assume it's just one value for now.
            // If it can be (r~-9:3:1), this logic needs adjustment.
            // Based on your explanation, the Y in (r~X:Y) is the easing param.
            result = `(${type}${mode}${value}:${duration || '1'})`;
        }
        
        outputInput.value = result + ')';
    }

    generateBtn.addEventListener('click', generateGimmick);
    [typeSelect, modeSelect, valueInput, durationInput, easingInput].forEach(el => el.addEventListener('input', generateGimmick));

    copyBtn.addEventListener('click', () => {
        if (!outputInput.value) return;
        navigator.clipboard.writeText(outputInput.value).then(
            () => alert('✅ 已複製特效指令'),
            () => alert('複製失敗')
        );
    });

    // Initial generation
    generateGimmick();
}