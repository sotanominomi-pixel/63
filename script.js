const MIN_N = 12;
const MAX_N = 48;
let currentN = 24; // デフォルトは通常速度（1日が24時間）
let isSecondsVisible = true; // 秒数表示設定
let currentLang = 'ja'; // 言語設定

// ----------------------------------------------------
// 1. N値に基づいた時計の「速さ」調整ロジック (骨格)
// ----------------------------------------------------

function calculateNTime(realTime) {
    const realSecondsInDay = 24 * 60 * 60;
    const nSecondsInDay = currentN * 60 * 60;
    
    // スピード倍率: N=12なら 2.0倍速 (時計は遅くなる) / N=48なら 0.5倍速 (時計は速くなる)
    // 実際に速くなるのは Nが小さくなるほどです
    const speedFactor = 24 / currentN; 
    
    // 調整後の秒数 = (リアルタイムの秒数) * (スピード倍率)
    const adjustedSeconds = (realTime / 1000) * speedFactor;
    
    // N時間表示に変換
    const adjustedDayLength = currentN * 60 * 60; // N時間の総秒数
    const secondsIntoN = adjustedSeconds % adjustedDayLength;

    const h = Math.floor(secondsIntoN / 3600);
    const m = Math.floor((secondsIntoN % 3600) / 60);
    const s = Math.floor(secondsIntoN % 60);
    
    return { h: h, m: m, s: s };
}

function updateClock() {
    const now = new Date();
    // リアルタイムでの今日の開始からの経過ミリ秒
    const realTimeOfDay = now.getTime() - new Date(now.toDateString()).getTime(); 
    
    const { h, m, s } = calculateNTime(realTimeOfDay);
    
    const formattedH = String(h).padStart(2, '0');
    const formattedM = String(m).padStart(2, '0');
    const formattedS = String(s).padStart(2, '0');
    
    let timeString = `${formattedH}:${formattedM}`;
    if (isSecondsVisible) {
        timeString += `:${formattedS}`;
    }

    const clockDisplay = document.getElementById('n-clock-display');
    if (clockDisplay) {
        clockDisplay.textContent = timeString;
    }
    const nValueDisplay = document.getElementById('n-value-display');
    if (nValueDisplay) {
        nValueDisplay.textContent = `N = ${currentN} ${currentLang === 'ja' ? '時間' : 'Hours'}`;
    }
}

// ----------------------------------------------------
// 2. モードのレンダリング関数
// ----------------------------------------------------

function renderClockMode() {
    document.getElementById('content-area').innerHTML = `
        <div class="mode-title">${currentLang === 'ja' ? '時計' : 'Clock'}</div>
        <div id="n-clock-display" class="clock-display">--:--</div>
        
        <div class="control-panel">
            <label for="n-slider">1日の時間 (N)</label>
            <input type="range" id="n-slider" min="${MIN_N}" max="${MAX_N}" value="${currentN}">
            <div id="n-value-display" class="n-value-display">N = ${currentN} ${currentLang === 'ja' ? '時間' : 'Hours'}</div>
        </div>
    `;
    setupNControl(); // DOMを挿入した後にコントロールを設定
    updateClock();
}

function renderStopwatchMode() {
    document.getElementById('content-area').innerHTML = `
        <div class="mode-title">${currentLang === 'ja' ? 'ストップウォッチ' : 'Stopwatch'}</div>
        <p style="text-align:center;">ストップウォッチの機能はこれから実装します。</p>
        `;
}

function renderAlarmMode() {
    document.getElementById('content-area').innerHTML = `
        <div class="mode-title">${currentLang === 'ja' ? 'アラーム' : 'Alarm'}</div>
        <p style="text-align:center;">アラームの機能はこれから実装します。</p>
        `;
}

function renderSettingsMode() {
    document.getElementById('content-area').innerHTML = `
        <div class="mode-title">${currentLang === 'ja' ? '設定' : 'Settings'}</div>
        <ul class="settings-list">
            <li>
                <span>${currentLang === 'ja' ? '秒数表示' : 'Show Seconds'}</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="seconds-toggle">
                    <span class="slider"></span>
                </label>
            </li>
            <li>
                <span>${currentLang === 'ja' ? '言語表示' : 'Language'}</span>
                <div class="segmented-control" id="language-control">
                    <button data-lang="ja" class="segment-button ${currentLang === 'ja' ? 'active' : ''}">${currentLang === 'ja' ? '日本語' : 'Japanese'}</button>
                    <button data-lang="en" class="segment-button ${currentLang === 'en' ? 'active' : ''}">${currentLang === 'ja' ? '英語' : 'English'}</button>
                </div>
            </li>
        </ul>
    `;
    setupSettings(); // DOMを挿入した後に設定ロジックを設定
}


// ----------------------------------------------------
// 3. コントロール/イベントハンドラの設定
// ----------------------------------------------------

function setupNControl() {
    const slider = document.getElementById('n-slider');
    if (slider) {
        slider.min = MIN_N;
        slider.max = MAX_N;
        slider.value = currentN;

        slider.oninput = (e) => {
            currentN = parseInt(e.target.value);
            updateClock();
        };
    }
}

function setupSettings() {
    // A. 秒数表示トグルの設定
    const secondsToggle = document.getElementById('seconds-toggle');
    if (secondsToggle) {
        secondsToggle.checked = isSecondsVisible;
        secondsToggle.onchange = (e) => {
            isSecondsVisible = e.target.checked;
            updateClock(); // 表示をすぐに反映
        };
    }
    
    // B. 言語セグメントコントロールのイベント設定
    const langControl = document.getElementById('language-control');
    if (langControl) {
        langControl.querySelectorAll('.segment-button').forEach(button => {
            button.addEventListener('click', () => {
                // 選択状態の切り替え
                langControl.querySelectorAll('.segment-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 言語設定の更新
                currentLang = button.dataset.lang;
                
                // 全てのモードと時計表示を更新
                renderCurrentMode(); 
                updateClock();
            });
        });
    }
}

// 現在表示されているモードを再レンダリングするヘルパー関数
function renderCurrentMode() {
    const activeTab = document.querySelector('.tab-item.active');
    if (!activeTab) return;

    switch (activeTab.id) {
        case 'nav-clock':
            renderClockMode();
            break;
        case 'nav-stopwatch':
            renderStopwatchMode();
            break;
        case 'nav-alarm':
            renderAlarmMode();
            break;
        case 'nav-settings':
            renderSettingsMode();
            break;
    }
    // ナビゲーションのラベルも言語に合わせて更新が必要な場合はここで処理
}

// 底部ナビゲーションの切り替え
function setupNavigation() {
    document.querySelectorAll('.tab-item').forEach(button => {
        button.addEventListener('click', (e) => {
            // アクティブクラスの切り替え
            document.querySelectorAll('.tab-item').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // モードのレンダリング
            renderCurrentMode();
        });
    });
}


// ----------------------------------------------------
// 4. アプリの初期化
// ----------------------------------------------------

function initApp() {
    // 1秒ごとに時計を更新
    setInterval(updateClock, 1000); 
    
    // ナビゲーションと初期表示モードを設定
    setupNavigation();
    renderClockMode(); // アプリ起動時は時計モード
}

document.addEventListener('DOMContentLoaded', initApp);
