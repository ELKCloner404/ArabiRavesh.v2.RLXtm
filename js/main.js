
/* ─── انتخابگر تم (گوشه بالا چپ) ─── */
const THEMES = {
    red: {
        light: '#f27c7c',
        main: '#cc3939',
        button: '#eda4a4',
        buttonHover: '#eb5a5a',
        shadowTmb: '#c87272',
        shadowBtn: '#c48989'
    },
    blue: {
        light: '#7cacf2',
        main: '#395ecc',
        button: '#a4b8ed',
        buttonHover: '#5a7aeb',
        shadowTmb: '#7299c8',
        shadowBtn: '#89a4c4'
    },
    yellow: {
        light: '#f2d47c',
        main: '#ccad39',
        button: '#eddea4',
        buttonHover: '#ebd05a',
        shadowTmb: '#c8b872',
        shadowBtn: '#c4b489'
    },
    green: {
        light: '#7cf29a',
        main: '#39cc5e',
        button: '#a4edb8',
        buttonHover: '#5aeb78',
        shadowTmb: '#72c886',
        shadowBtn: '#89c49a'
    }
};

const THEME_ORDER = ['red', 'blue', 'yellow', 'green'];
const THEME_STORAGE_KEY = 'pj1-theme';
let currentTheme = 'red';

function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    currentTheme = themeName;
    const root = document.documentElement;

    root.style.setProperty('--theme-light', theme.light);
    root.style.setProperty('--theme-main', theme.main);
    root.style.setProperty('--theme-button', theme.button);
    root.style.setProperty('--theme-button-hover', theme.buttonHover);
    root.style.setProperty('--theme-shadow-tmb', theme.shadowTmb);
    root.style.setProperty('--theme-shadow-btn', theme.shadowBtn);

    localStorage.setItem(THEME_STORAGE_KEY, themeName);

    const toggle = document.querySelector('.theme-picker__toggle');
    if (toggle) {
        toggle.style.backgroundColor = theme.light;
    }

    document.querySelectorAll('.theme-picker__swatch').forEach((swatch) => {
        swatch.classList.toggle('is-active', swatch.dataset.theme === themeName);
    });
}

function renderThemeSwatches(panel) {
    panel.innerHTML = '';
    const others = THEME_ORDER.filter((name) => name !== currentTheme);

    others.forEach((name) => {
        const theme = THEMES[name];
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'theme-picker__swatch';
        swatch.dataset.theme = name;
        swatch.style.backgroundColor = theme.light;
        swatch.style.border = `3px solid ${theme.main}`;
        swatch.setAttribute('aria-label', name);
        swatch.addEventListener('click', () => {
            applyTheme(name);
            renderThemeSwatches(panel);
        });
        panel.appendChild(swatch);
    });
}

function getQueryParam(name) {
    return new URLSearchParams(location.search).get(name);
}

function getGameLevel() {
    const level = getQueryParam('level');
    if (level && GAME_DATA[level]) return level;
    const page = location.pathname.split('/').pop() || '';
    if (page.includes('super_pro.html') || page.includes('game.html')) return 'super_pro';
    if (page.includes('pro.html')) return 'pro';
    if (page.includes('game_easy.html')) return 'easy';
    return 'easy';
}

function getGamePageForLevel(level) {
    if (level === 'pro') return 'pro.html';
    if (level === 'super_pro') return 'super_pro.html';
    return 'game_easy.html';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCurrentQuestion() {
    if (gameQuestions.length === 0) {
        gameQuestions = shuffleArray([...GAME_DATA[getGameLevel()]]);
    }
    return gameQuestions[gameQuestionIndex % gameQuestions.length];
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById('game-score');
    if (scoreEl) scoreEl.textContent = String(gameScore);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('game-timer');
    if (timerEl) timerEl.textContent = String(gameTimeLeft);
}

function setOptionsDisabled(value) {
    document.querySelectorAll('.option-button').forEach((button) => {
        button.disabled = value;
    });
}

function renderLoadingMessage() {
    const quoteEl = document.querySelector('.loading-quote');
    const sourceEl = document.querySelector('.loading-source');
    const addrEl = document.querySelector('.loading-addr');
    if (!quoteEl || !sourceEl || !addrEl) return;

    const item = LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)];
    quoteEl.textContent = item.quote;
    sourceEl.textContent = item.source;
    addrEl.textContent = item.addr;
}

function showLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    const game = document.getElementById('game-screen');
    const end = document.getElementById('end-screen');
    if (loading) loading.classList.remove('hidden');
    if (game) game.classList.add('hidden');
    if (end) end.classList.add('hidden');
    renderLoadingMessage();
}

function showGameScreen() {
    const loading = document.getElementById('loading-screen');
    const game = document.getElementById('game-screen');
    if (loading) loading.classList.add('hidden');
    if (game) game.classList.remove('hidden');
}

const SCORES_KEY = 'pj1-scores';
const PROFILE_KEY = 'pj1-profile';

function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadProfile() {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
}

function saveGameScore(score, level, nameVal, familyVal, numberVal, schoolVal) {
    const multiplier = level === 'super_pro' ? 3 : level === 'pro' ? 2 : 1;
    const finalScore = score * multiplier;
    let scores = [];
    try {
        const existing = localStorage.getItem(SCORES_KEY);
        if (existing) scores = JSON.parse(existing);
        if (!Array.isArray(scores)) scores = [];
    } catch { scores = []; }
    scores.push({ name: nameVal, family: familyVal, number: numberVal, school: schoolVal || '', score: finalScore, level, date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 50);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

function renderLeaderboard() {
    const listEl = document.querySelector('.leaderboard-list');
    if (!listEl) return;
    let scores = [];
    try {
        const data = localStorage.getItem(SCORES_KEY);
        if (data) scores = JSON.parse(data);
        if (!Array.isArray(scores)) scores = [];
    } catch { scores = []; }
    if (scores.length === 0) {
        listEl.innerHTML = '<div class="leaderboard-empty">هنوز امتیازی ثبت نشده</div>';
        return;
    }
    listEl.innerHTML = scores.map((s, i) => {
        const levelNames = { easy: 'ساده', pro: 'پیشرفته', super_pro: 'فوق پیشرفته' };
        const lvl = levelNames[s.level] || s.level || 'ساده';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `<div class="leaderboard-row">
            <span class="leaderboard-rank">${medal || (i + 1)}</span>
            <span class="leaderboard-name">${s.name || ''} ${s.family || ''}</span>
            <span class="leaderboard-number">${s.number || ''}</span>
            <span class="leaderboard-number">${s.school || ''}</span>
            <span class="leaderboard-level">${lvl}</span>
            <span class="leaderboard-score">${s.score}</span>
        </div>`;
    }).join('');
}

function openAdminLogin() {
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.innerHTML = `
        <div class="admin-modal">
            <h3>🔐 پنل مدیریت</h3>
            <p class="admin-error" id="admin-error" style="display:none;">رمز اشتباه است</p>
            <input type="password" id="admin-password" placeholder="رمز عبور را وارد کنید" dir="ltr">
            <div class="admin-modal-actions">
                <button class="admin-login-btn" id="admin-login-submit">ورود</button>
                <button class="admin-cancel-btn" id="admin-login-cancel">انصراف</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const pwInput = overlay.querySelector('#admin-password');
    const loginBtn = overlay.querySelector('#admin-login-submit');
    const cancelBtn = overlay.querySelector('#admin-login-cancel');
    const errorEl = overlay.querySelector('#admin-error');

    const close = () => overlay.remove();

    loginBtn.addEventListener('click', () => {
        if (pwInput.value === 'arabi405') {
            close();
            renderAdminPanel();
        } else {
            errorEl.style.display = 'block';
            pwInput.value = '';
            pwInput.focus();
        }
    });

    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
    setTimeout(() => pwInput.focus(), 100);
}

function renderAdminPanel() {
    let scores = [];
    try {
        const data = localStorage.getItem(SCORES_KEY);
        if (data) scores = JSON.parse(data);
        if (!Array.isArray(scores)) scores = [];
    } catch { scores = []; }

    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.innerHTML = `
        <div class="admin-modal" style="width:min(550px,94vw);">
            <h3 style="color:#d33d3d;">🔧 پنل مدیریت</h3>
            <div class="admin-panel">
                <h3>🗑️ حذف کاربر</h3>
                ${scores.length === 0 ? '<p style="text-align:center;color:#888;padding:1rem;">هیچ کاربری وجود ندارد</p>' : `
                <div id="admin-list">
                    ${scores.map((s, i) => `
                        <div class="admin-row" data-index="${i}">
                            <span>${i + 1}</span>
                            <span>${s.name || ''} ${s.family || ''}</span>
                            <span>${s.number || ''}</span>
                            <span>${s.school || ''}</span>
                            <span>${s.score}</span>
                            <button class="admin-del-btn">حذف</button>
                        </div>
                    `).join('')}
                </div>
                `}
            </div>
            ${scores.length > 0 ? '<button class="admin-del-all-btn" id="admin-del-all">🗑️ حذف همه</button>' : ''}
            <button class="admin-close-btn" id="admin-panel-close">بستن</button>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.admin-del-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.admin-row');
            const index = parseInt(row.dataset.index, 10);
            scores.splice(index, 1);
            localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
            overlay.remove();
            renderAdminPanel();
            renderLeaderboard();
        });
    });

    const delAllBtn = overlay.querySelector('#admin-del-all');
    if (delAllBtn) {
        delAllBtn.addEventListener('click', () => {
            if (confirm('آیا از حذف همه کاربران اطمینان دارید؟')) {
                localStorage.setItem(SCORES_KEY, '[]');
                overlay.remove();
                renderAdminPanel();
                renderLeaderboard();
            }
        });
    }

    overlay.querySelector('#admin-panel-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function showEndScreen() {
    const game = document.getElementById('game-screen');
    if (game) game.classList.add('hidden');

    const level = getGameLevel();
    const multiplier = level === 'super_pro' ? 3 : level === 'pro' ? 2 : 1;
    const finalScoreVal = gameScore * multiplier;
    const profile = loadProfile();

    const overlay = document.createElement('div');
    overlay.className = 'end-overlay';
    overlay.innerHTML = `
        <div class="end-modal">
            <p class="game-end-title">زمان تمام شد!</p>
            <p class="game-end-score">امتیاز شما: <strong>${finalScoreVal}</strong></p>
            <div class="end-form">
                <input class="end-form__input" id="end-name" placeholder="نام" value="${profile?.name || ''}" required>
                <input class="end-form__input" id="end-family" placeholder="نام خانوادگی" value="${profile?.family || ''}" required>
                <input class="end-form__input" id="end-number" placeholder="شماره کلاس" value="${profile?.number || ''}" required>
                <input class="end-form__input" id="end-school" placeholder="مدرسه" value="${profile?.school || ''}" required>
                <button class="b-game end-form__save" id="end-save-btn"><div><p class="bgtxt">ذخیره امتیاز</p></div></button>
                <a class="b-game" href="./hub.html" style="margin-top:0.3rem;text-decoration:none;color:#000;"><div><p class="bgtxt">بازگشت</p></div></a>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('end-save-btn').addEventListener('click', () => {
        const nameVal = document.getElementById('end-name')?.value.trim();
        const familyVal = document.getElementById('end-family')?.value.trim();
        const numberVal = document.getElementById('end-number')?.value.trim();
        const schoolVal = document.getElementById('end-school')?.value.trim();
        if (!nameVal || !familyVal || !numberVal || !schoolVal) return;
        saveProfile({ name: nameVal, family: familyVal, number: numberVal, school: schoolVal });
        saveGameScore(gameScore, level, nameVal, familyVal, numberVal, schoolVal);
        setTimeout(() => { location.href = 'index.html'; }, 50);
    });
}

const VERB_PATTERNS = [
    "فَعَلَ - یَفعَلُ",
    "أَفْعَلَ - یُفْعِلُ",
    "فَاعَلَ - یُفَاعِلُ",
    "فَعَّلَ - یُفَعِّلُ",
    "تَفَعَّلَ - یَتَفَعَّلُ",
    "تَفَاعَلَ - یَتَفَاعَلُ",
    "اِفْتَعَلَ - یَفْتَعِلُ",
    "اِسْتَفْعَلَ - یَسْتَفْعِلُ"
];

const MUSTADAR_WEIGHTS = ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"];

function stripHarakat(str) {
    return str.replace(/[\u064B-\u0652\u0640]/g, '');
}

function renderQuestion() {
    const question = getCurrentQuestion();
    const verbEl = document.getElementById('game-verb');
    const optionsWrap = document.getElementById('game-options');
    if (!question || !verbEl || !optionsWrap) return;

    gameAnswered = false;
    optionsWrap.innerHTML = '';
    optionsWrap.className = 'game-options';

    const level = getGameLevel();

    if (level === 'super_pro') {
        verbEl.innerHTML = `<span class="arabic-verb">${question.past} - ${question.present}</span>`;
        optionsWrap.classList.add('game-options--grid2', 'game-options--super');
        const pool = shuffleArray([...MUSTADAR_WEIGHTS]);
        const selected = pool.slice(0, 5);
        if (!selected.includes(question.correct)) {
            selected[0] = question.correct;
        }
        const options = shuffleArray(selected);
        options.forEach((option, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-button';
            btn.textContent = option;
            btn.addEventListener('click', () => handleAnswer(option, btn));
            optionsWrap.appendChild(btn);
            if (i === options.length - 1) btn.classList.add('option-button--last');
        });
    } else if (level === 'pro') {
        verbEl.innerHTML = `<span class="arabic-verb">${question.past}</span>`;
        const label = document.querySelector('.game-question__label');
        if (label) label.textContent = 'ماضی:';
        optionsWrap.classList.add('game-options--pro-input');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pro-input';
        input.id = 'pro-answer-input';
        input.placeholder = 'مضارع را بنویسید';
        input.setAttribute('dir', 'rtl');

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'pro-submit-btn';
        submitBtn.textContent = 'تأیید';
        submitBtn.addEventListener('click', () => handleProSubmit());

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleProSubmit();
        });

        optionsWrap.appendChild(input);
        optionsWrap.appendChild(submitBtn);

        setTimeout(() => input.focus(), 100);
    } else {
        verbEl.innerHTML = `<span class="arabic-verb">${question.past} - ${question.present}</span>`;
        const label = document.querySelector('.game-question__label');
        if (label) label.textContent = 'فعل ماضی - مضارع:';
        optionsWrap.classList.add('game-options--grid2');
        const pool = shuffleArray([...VERB_PATTERNS]);
        const selected = shuffleArray(pool).slice(0, 4);
        if (!selected.includes(question.correct)) {
            selected[0] = question.correct;
        }
        const options = shuffleArray(selected);
        options.forEach((option) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-button';
            btn.textContent = option;
            btn.addEventListener('click', () => handleAnswer(option, btn));
            optionsWrap.appendChild(btn);
        });
    }
}

function handleAnswer(selectedOption, button) {
    if (gameAnswered) return;
    gameAnswered = true;

    const question = getCurrentQuestion();
    if (!question) return;

    const isCorrect = selectedOption === question.correct;
    const allButtons = document.querySelectorAll('.option-button');
    setOptionsDisabled(true);

    if (isCorrect) {
        gameScore += 1;
    } else {
        button.classList.add('incorrect');
        gameScore = Math.max(0, gameScore - 1);
    }

    allButtons.forEach((btn) => {
        if (btn.textContent === question.correct) {
            btn.classList.add('correct');
        }
    });

    updateScoreDisplay();
    setTimeout(() => {
        gameQuestionIndex += 1;
        renderQuestion();
        setOptionsDisabled(false);
    }, 900);
}

function handleProSubmit() {
    if (gameAnswered) return;
    const input = document.getElementById('pro-answer-input');
    if (!input) return;
    const answer = stripHarakat(input.value.trim());
    if (!answer) return;

    gameAnswered = true;

    const question = getCurrentQuestion();
    if (!question) return;

    const correct = stripHarakat(question.present);
    const isCorrect = answer === correct;
    const submitBtn = document.querySelector('.pro-submit-btn');
    const existingFeedback = document.querySelector('.pro-feedback');
    if (existingFeedback) existingFeedback.remove();

    if (isCorrect) {
        gameScore += 1;
        input.classList.add('pro-input--correct');
        if (submitBtn) submitBtn.textContent = '✓ درست';
    } else {
        gameScore = Math.max(0, gameScore - 1);
        input.classList.add('pro-input--incorrect');
        if (submitBtn) submitBtn.textContent = '✗ غلط';
        const feedback = document.createElement('p');
        feedback.className = 'pro-feedback';
        feedback.textContent = `پاسخ درست: ${question.present}`;
        const optsWrap = document.getElementById('game-options');
        if (optsWrap) optsWrap.appendChild(feedback);
    }

    input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    updateScoreDisplay();
    setTimeout(() => {
        gameQuestionIndex += 1;
        renderQuestion();
    }, 1500);
}

function showStartOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'game-start-overlay';
    overlay.innerHTML = `
        <div class="game-start-box">
            <button class="game-start-btn" id="game-start-btn">شروع بازی</button>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('game-start-btn').addEventListener('click', () => {
        overlay.remove();
        startCountdown();
    });
}

function startCountdown() {
    const overlay = document.createElement('div');
    overlay.className = 'game-countdown';
    const numEl = document.createElement('div');
    numEl.className = 'game-countdown__number';
    overlay.appendChild(numEl);
    document.body.appendChild(overlay);

    let count = 3;
    numEl.textContent = String(count);

    const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
            numEl.textContent = String(count);
            numEl.style.animation = 'none';
            void numEl.offsetHeight;
            numEl.style.animation = 'countPop 0.6s ease-out';
        } else if (count === 0) {
            numEl.textContent = 'شروع!';
            numEl.style.fontSize = 'clamp(3rem, 10vw, 6rem)';
            numEl.style.animation = 'none';
            void numEl.offsetHeight;
            numEl.style.animation = 'countPop 0.6s ease-out';
        } else {
            clearInterval(interval);
            overlay.remove();
            startGame();
        }
    }, 800);
}

function startGame() {
    gameTimeLeft = getGameDuration();
    gameScore = 0;
    gameQuestionIndex = 0;
    gameQuestions = shuffleArray([...GAME_DATA[getGameLevel()]]);
    updateScoreDisplay();
    updateTimerDisplay();
    showGameScreen();
    renderQuestion();

    if (gameTimer) {
        clearInterval(gameTimer);
    }

    gameTimer = setInterval(() => {
        gameTimeLeft -= 1;
        updateTimerDisplay();

        if (gameTimeLeft <= 0) {
            clearInterval(gameTimer);
            gameTimer = null;
            showEndScreen();
        }
    }, 1000);
}

function startGameLoading() {
    showLoadingScreen();
    const delay = 2200 + Math.random() * 1200;
    setTimeout(startGame, delay);
}

const TRACKS = [
    { id: 'interstellar', title: 'Interstellar', src: './audio/interstellar.mp3' },
    { id: 'last-of-us', title: 'Last of Us', src: './audio/last-of-us.mp3' },
    { id: 'game-of-thrones', title: 'Game of Thrones', src: './audio/game-of-thrones.mp3' }
];

function getGameDuration() {
    const level = getGameLevel();
    if (level === 'easy') return 40;
    return 60;
}
const LOADING_QUOTES = [
    {
        quote: 'دانش بهتر از مال است؛ دانش تو را نگهبانی می‌کند و مال را تو باید نگهبانی کنی.',
        source: 'نهج‌البلاغه، حکمت 147',
    },
    {
        quote: 'صبر دو گونه است: صبر بر آنچه آزارت می‌دهد و صبر بر آنچه دوستش داری.',
        source: 'نهج‌البلاغه، حکمت 55',
    },
    {
        quote: 'بهترین شیوه‌ی کیفر دشمن، نیکی کردن به اوست.',
        source: 'نهج‌البلاغه، حکمت 11',
    },
    {
        quote: 'انسان زیر زبان خود پنهان است.',
        source: 'نهج‌البلاغه، حکمت 148',
    },
    {
        quote: 'کسی که شکر نعمت‌های کوچک نکند، نعمت‌های بزرگ را نیز شکر نخواهد کرد.',
        source: 'نهج‌البلاغه، حکمت 162',
    },
    {
        quote: 'وقتی حکمت کامل شود، سخن کم می‌شود.',
        source: 'نهج‌البلاغه، حکمت 349',
    },
    {
        quote: 'غرور، انسان را از طلب دانش بازمی‌دارد.',
        source: 'نهج‌البلاغه، حکمت 263',
    },
    {
        quote: 'حسد ایمان را می‌خورد همان‌گونه که آتش هیزم را می‌سوزاند.',
        source: 'نهج‌البلاغه، حکمت 38',
    },
    {
        quote: 'زمان بدن‌ها را فرسوده می‌کند، امیدها را تازه می‌سازد، مرگ را نزدیک می‌کند و آرزوها را می‌برد.',
        source: 'نهج‌البلاغه، حکمت 114',
    },
    {
        quote: 'برده‌ی دیگران مباش، در حالی که خداوند تو را آزاد آفریده است.',
        source: 'نهج‌البلاغه، حکمت 426',
    },
    {
        quote: 'بهترین انتقام، بخشش است.',
        source: 'نهج‌البلاغه، حکمت 201',
    }
];

const GAME_DATA = {
    easy: [
        { past: "ذَهَبَ", present: "یَذهَبُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "فَتَحَ", present: "یَفتَحُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "جَمَعَ", present: "یَجمَعُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "قَرَأَ", present: "یَقرَأُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "شَرَحَ", present: "یَشرَحُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "ضَرَبَ", present: "یَضرِبُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "جَلَسَ", present: "یَجلِسُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "حَمَلَ", present: "یَحمِلُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "نَزَلَ", present: "یَنزِلُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "عَرَفَ", present: "یَعرِفُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "کَتَبَ", present: "یَکتُبُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "نَصَرَ", present: "یَنصُرُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "دَخَلَ", present: "یَدخُلُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "خَرَجَ", present: "یَخرُجُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "عَبَدَ", present: "یَعبُدُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "أَکْرَمَ", present: "یُکْرِمُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَحْسَنَ", present: "یُحْسِنُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَسْلَمَ", present: "یُسْلِمُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَنْزَلَ", present: "یُنْزِلُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَشْرَقَ", present: "یُشْرِقُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "قَاتَلَ", present: "یُقَاتِلُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "جَاهَدَ", present: "یُجَاهِدُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "سَاعَدَ", present: "یُسَاعِدُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "نَاظَرَ", present: "یُنَاظِرُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "وَافَقَ", present: "یُوَافِقُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "عَلَّمَ", present: "یُعَلِّمُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "کَسَّرَ", present: "یُکَسِّرُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "غَیَّرَ", present: "یُغَیِّرُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "فَکَّرَ", present: "یُفَکِّرُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "نَظَّفَ", present: "یُنَظِّفُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "تَعَلَّمَ", present: "یَتَعَلَّمُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَکَسَّرَ", present: "یَتَکَسَّرُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَذَکَّرَ", present: "یَتَذَکَّرُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَفَرَّقَ", present: "یَتَفَرَّقُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَجَمَّعَ", present: "یَتَجَمَّعُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَنَازَعَ", present: "یَتَنَازَعُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَقَاتَلَ", present: "یَتَقَاتَلُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَکَاتَبَ", present: "یَتَکَاتَبُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَنَاصَرَ", present: "یَتَنَاصَرُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَشَارَکَ", present: "یَتَشَارَکُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "اِفْتَتَحَ", present: "یَفْتَتِحُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِجْتَمَعَ", present: "یَجْتَمِعُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِنْتَظَرَ", present: "یَنْتَظِرُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِنْتَصَرَ", present: "یَنْتَصِرُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِعْتَمَدَ", present: "یَعْتَمِدُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِسْتَغْفَرَ", present: "یَسْتَغْفِرُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَخْرَجَ", present: "یَسْتَخْرِجُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَقْبَلَ", present: "یَسْتَقْبِلُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَعْمَلَ", present: "یَسْتَعْمِلُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَرْجَعَ", present: "یَسْتَرْجِعُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" }
    ],
    pro: [
        { past: "ذَهَبَ", present: "یَذهَبُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "فَتَحَ", present: "یَفتَحُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "جَمَعَ", present: "یَجمَعُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "قَرَأَ", present: "یَقرَأُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "شَرَحَ", present: "یَشرَحُ", correct: "فَعَلَ - یَفعَلُ" },
        { past: "ضَرَبَ", present: "یَضرِبُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "جَلَسَ", present: "یَجلِسُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "حَمَلَ", present: "یَحمِلُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "نَزَلَ", present: "یَنزِلُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "عَرَفَ", present: "یَعرِفُ", correct: "فَعَلَ - یَفعِلُ" },
        { past: "کَتَبَ", present: "یَکتُبُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "نَصَرَ", present: "یَنصُرُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "دَخَلَ", present: "یَدخُلُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "خَرَجَ", present: "یَخرُجُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "عَبَدَ", present: "یَعبُدُ", correct: "فَعَلَ - یَفعُلُ" },
        { past: "أَکْرَمَ", present: "یُکْرِمُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَحْسَنَ", present: "یُحْسِنُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَسْلَمَ", present: "یُسْلِمُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَنْزَلَ", present: "یُنْزِلُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "أَشْرَقَ", present: "یُشْرِقُ", correct: "أَفْعَلَ - یُفْعِلُ" },
        { past: "قَاتَلَ", present: "یُقَاتِلُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "جَاهَدَ", present: "یُجَاهِدُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "سَاعَدَ", present: "یُسَاعِدُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "نَاظَرَ", present: "یُنَاظِرُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "وَافَقَ", present: "یُوَافِقُ", correct: "فَاعَلَ - یُفَاعِلُ" },
        { past: "عَلَّمَ", present: "یُعَلِّمُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "کَسَّرَ", present: "یُکَسِّرُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "غَیَّرَ", present: "یُغَیِّرُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "فَکَّرَ", present: "یُفَکِّرُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "نَظَّفَ", present: "یُنَظِّفُ", correct: "فَعَّلَ - یُفَعِّلُ" },
        { past: "تَعَلَّمَ", present: "یَتَعَلَّمُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَکَسَّرَ", present: "یَتَکَسَّرُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَذَکَّرَ", present: "یَتَذَکَّرُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَفَرَّقَ", present: "یَتَفَرَّقُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَجَمَّعَ", present: "یَتَجَمَّعُ", correct: "تَفَعَّلَ - یَتَفَعَّلُ" },
        { past: "تَنَازَعَ", present: "یَتَنَازَعُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَقَاتَلَ", present: "یَتَقَاتَلُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَکَاتَبَ", present: "یَتَکَاتَبُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَنَاصَرَ", present: "یَتَنَاصَرُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "تَشَارَکَ", present: "یَتَشَارَکُ", correct: "تَفَاعَلَ - یَتَفَاعَلُ" },
        { past: "اِفْتَتَحَ", present: "یَفْتَتِحُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِجْتَمَعَ", present: "یَجْتَمِعُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِنْتَظَرَ", present: "یَنْتَظِرُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِنْتَصَرَ", present: "یَنْتَصِرُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِعْتَمَدَ", present: "یَعْتَمِدُ", correct: "اِفْتَعَلَ - یَفْتَعِلُ" },
        { past: "اِسْتَغْفَرَ", present: "یَسْتَغْفِرُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَخْرَجَ", present: "یَسْتَخْرِجُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَقْبَلَ", present: "یَسْتَقْبِلُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَعْمَلَ", present: "یَسْتَعْمِلُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" },
        { past: "اِسْتَرْجَعَ", present: "یَسْتَرْجِعُ", correct: "اِسْتَفْعَلَ - یَسْتَفْعِلُ" }
    ],
    super_pro: [
        { past: "عَلَّمَ", present: "یُعَلِّمُ", correct: "تَفْعِیل", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "کَسَّرَ", present: "یُکَسِّرُ", correct: "تَفْعِیل", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "قَاتَلَ", present: "یُقَاتِلُ", correct: "مُفَاعَلَة", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "جَاهَدَ", present: "یُجَاهِدُ", correct: "مُفَاعَلَة", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "أَکْرَمَ", present: "یُکْرِمُ", correct: "إِفْعَال", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "أَحْسَنَ", present: "یُحْسِنُ", correct: "إِفْعَال", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "تَعَلَّمَ", present: "یَتَعَلَّمُ", correct: "تَفَعُّل", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "تَکَسَّرَ", present: "یَتَکَسَّرُ", correct: "تَفَعُّل", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "تَنَازَعَ", present: "یَتَنَازَعُ", correct: "تَفَاعُل", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "تَقَاتَلَ", present: "یَتَقَاتَلُ", correct: "تَفَاعُل", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "اِفْتَتَحَ", present: "یَفْتَتِحُ", correct: "اِفْتِعَال", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "اِجْتَمَعَ", present: "یَجْتَمِعُ", correct: "اِفْتِعَال", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "اِسْتَغْفَرَ", present: "یَسْتَغْفِرُ", correct: "اسْتِفْعَال", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] },
        { past: "اِسْتَخْرَجَ", present: "یَسْتَخْرِجُ", correct: "اسْتِفْعَال", options: ["إِفْعَال", "تَفْعِیل", "مُفَاعَلَة", "تَفَعُّل", "تَفَاعُل", "اِفْتِعَال", "اسْتِفْعَال"] }
    ]
};

let gameTimer = null;
let gameTimeLeft = getGameDuration();
let gameScore = 0;
let gameQuestionIndex = 0;
let gameAnswered = false;
let gameQuestions = [];

const AUDIO_STORAGE_KEY = 'pj1-audio';
const bgAudio = new Audio();
let audioSaveTimer = null;
let settingsOverlay = null;
let creatorsOverlay = null;

function getDefaultAudioState() {
    return {
        trackId: null,
        playing: false,
        volume: 0.8,
        positions: {}
    };
}

function loadAudioState() {
    try {
        const saved = localStorage.getItem(AUDIO_STORAGE_KEY);
        return saved ? { ...getDefaultAudioState(), ...JSON.parse(saved) } : getDefaultAudioState();
    } catch {
        return getDefaultAudioState();
    }
}

function saveAudioState() {
    const state = loadAudioState();
    state.volume = bgAudio.volume;

    if (state.trackId) {
        state.positions[state.trackId] = bgAudio.currentTime;
        state.playing = !bgAudio.paused && !bgAudio.ended;
    }

    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(state));
}

function getTrackById(trackId) {
    return TRACKS.find((t) => t.id === trackId);
}

function updateTrackButtonsUI() {
    const state = loadAudioState();
    const isPlaying = state.trackId && state.playing && !bgAudio.paused;

    document.querySelectorAll('.settings-track').forEach((row) => {
        const id = row.dataset.track;
        const playing = isPlaying && state.trackId === id;
        row.classList.toggle('is-playing', playing);

        const btn = row.querySelector('.settings-track__play');
        if (btn) {
            btn.textContent = playing ? '⏸' : '▶';
            btn.classList.toggle('is-paused', playing);
            btn.setAttribute('aria-label', playing ? 'توقف' : 'پخش');
        }
    });
}

function playTrack(trackId) {
    const state = loadAudioState();
    const track = getTrackById(trackId);
    if (!track) return;

    if (state.trackId === trackId) {
        if (!bgAudio.paused) {
            state.playing = false;
            state.positions[trackId] = bgAudio.currentTime;
            saveAudioState();
            updateTrackButtonsUI();
            bgAudio.pause();
            return;
        }

        state.playing = true;
        saveAudioState();
        updateTrackButtonsUI();
        bgAudio.play().catch(() => {
            state.playing = false;
            saveAudioState();
            updateTrackButtonsUI();
        });
        return;
    }

    if (state.trackId) {
        state.positions[state.trackId] = bgAudio.currentTime;
    }

    state.trackId = trackId;
    state.playing = true;
    bgAudio.src = track.src;
    bgAudio.currentTime = state.positions[trackId] || 0;
    bgAudio.volume = state.volume;
    saveAudioState();
    updateTrackButtonsUI();
    bgAudio.play().catch(() => {
        if (state.trackId === trackId) {
            state.playing = false;
            saveAudioState();
            updateTrackButtonsUI();
        }
    });
}

function initMouseBackground() {
    const particles = [];
    const sizes = [23, 15, 11];

    for (const size of sizes) {
        const el = document.createElement('div');
        el.className = 'bg-particle';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.opacity = '0.5';
        el.style.background = 'rgba(255,255,255,0.5)';
        el.style.left = '0px';
        el.style.top = '0px';
        document.body.appendChild(el);
        particles.push({ el, x: 0, y: 0, size });
    }

    let mouseX = 0, mouseY = 0;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!rafId) {
            rafId = requestAnimationFrame(function moveParticles() {
                particles.forEach((p) => {
                    p.x = mouseX;
                    p.y = mouseY;
                    p.el.style.left = (p.x - p.size / 2) + 'px';
                    p.el.style.top = (p.y - p.size / 2) + 'px';
                });
                rafId = requestAnimationFrame(moveParticles);
            });
        }
    });
}

function initAudioPlayer() {
    const state = loadAudioState();
    bgAudio.volume = state.volume;

    bgAudio.addEventListener('timeupdate', () => {
        if (!bgAudio.paused) {
            clearTimeout(audioSaveTimer);
            audioSaveTimer = setTimeout(saveAudioState, 400);
        }
    });

    bgAudio.addEventListener('pause', () => {
        saveAudioState();
        updateTrackButtonsUI();
    });

    bgAudio.addEventListener('play', () => {
        saveAudioState();
        updateTrackButtonsUI();
    });

    if (!state.trackId) return;

    const track = getTrackById(state.trackId);
    if (!track) return;

    bgAudio.src = track.src;
    bgAudio.currentTime = state.positions[state.trackId] || 0;

    if (state.playing) {
        bgAudio.play().catch(() => {});
    }

    updateTrackButtonsUI();
}

function openSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateTrackButtonsUI();
}

function closeSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

function initSettingsModal() {
    if (settingsOverlay) return;

    settingsOverlay = document.createElement('div');
    settingsOverlay.className = 'settings-overlay';

    const modal = document.createElement('div');
    modal.className = 'settings-modal';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'settings-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'بستن');
    closeBtn.addEventListener('click', closeSettings);

    const title = document.createElement('h2');
    title.className = 'settings-title';
    title.textContent = 'تنظیمات';

    const list = document.createElement('ul');
    list.className = 'settings-tracks';

    TRACKS.forEach((track) => {
        const item = document.createElement('li');
        item.className = 'settings-track';
        item.dataset.track = track.id;

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'settings-track__play';
        playBtn.textContent = '▶';
        playBtn.addEventListener('click', () => playTrack(track.id));

        const name = document.createElement('span');
        name.className = 'settings-track__name';
        name.textContent = track.title;

        item.appendChild(playBtn);
        item.appendChild(name);
        list.appendChild(item);
    });

    const volumeWrap = document.createElement('div');
    volumeWrap.className = 'settings-volume';

    const volumeLabel = document.createElement('span');
    volumeLabel.className = 'settings-volume__label';
    volumeLabel.textContent = 'بلندی صدا';

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.className = 'settings-volume__slider';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = String(Math.round(loadAudioState().volume * 100));
    volumeSlider.addEventListener('input', () => {
        bgAudio.volume = volumeSlider.value / 100;
        saveAudioState();
    });

    volumeWrap.appendChild(volumeLabel);
    volumeWrap.appendChild(volumeSlider);

    modal.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(list);
    modal.appendChild(volumeWrap);
    settingsOverlay.appendChild(modal);

    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            closeSettings();
        }
    });

    document.body.appendChild(settingsOverlay);
    window.openSettings = openSettings;
}

function openCreators() {
    if (!creatorsOverlay) return;
    creatorsOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeCreators() {
    if (!creatorsOverlay) return;
    creatorsOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

function initCreatorsModal() {
    if (creatorsOverlay) return;

    creatorsOverlay = document.createElement('div');
    creatorsOverlay.className = 'settings-overlay';

    const modal = document.createElement('div');
    modal.className = 'settings-modal';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'settings-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'بستن');
    closeBtn.addEventListener('click', closeCreators);

    const title = document.createElement('h2');
    title.className = 'settings-title';
    title.textContent = 'سازندگان';

    const content = document.createElement('div');
    content.className = 'creators-content';
    content.innerHTML = `
        <div class="creator-card-modal">
            <div class="creator-card-modal-profile">
                <img src="./img/taha.jpg" alt="امیر طاها شناسا" class="creator-profile-image" onerror="this.classList.add('error')">
            </div>
            <div class="creator-card-modal-header">امیر طاها شناسا</div>
            <div class="creator-card-modal-body">
                <div class="creator-card-modal-role">برنامه‌نویس</div>
                <div class="creator-card-modal-skills">
                    <span class="skill-badge-modal">HTML</span>
                    <span class="skill-badge-modal">CSS</span>
                    <span class="skill-badge-modal">JS</span>
                </div>
            </div>
        </div>

        <div class="creator-card-modal">
            <div class="creator-card-modal-profile">
                <img src="./img/yazdan.jpg" alt="یزدان طالع" class="creator-profile-image" onerror="this.classList.add('error')">
            </div>
            <div class="creator-card-modal-header">یزدان طالع</div>
            <div class="creator-card-modal-body">
                <div class="creator-card-modal-role"> برنامه‌نویس</div>
                <div class="creator-card-modal-skills">
                    <span class="skill-badge-modal">HTML</span>
                    <span class="skill-badge-modal">CSS</span>
                    <span class="skill-badge-modal">JS</span>
                </div>
            </div>
        </div>

        <div class="creator-card-modal">
            <div class="creator-card-modal-profile">
                <img src="./img/kian.jpg" alt="کیان مفیدی " class="creator-profile-image" onerror="this.classList.add('error')">
            </div>
            <div class="creator-card-modal-header">کیان مفیدی </div>
            <div class="creator-card-modal-body">
                <div class="creator-card-modal-role"> بالا آوردن بازی روی سرور</div>
            </div>
        </div>

        <div class="creator-card-modal">
            <div class="creator-card-modal-profile">
                <img src="./img/mahdiyar.jpg" alt="مهدیار صادقکار" class="creator-profile-image" onerror="this.classList.add('error')">
            </div>
            <div class="creator-card-modal-header">مهدیار صادقکار</div>
            <div class="creator-card-modal-body">
                <div class="creator-card-modal-role">نقاد و ایده‌پرداز</div>
            </div>
        </div>
    `;

    modal.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(content);
    creatorsOverlay.appendChild(modal);

    creatorsOverlay.addEventListener('click', (e) => {
        if (e.target === creatorsOverlay) {
            closeCreators();
        }
    });

    document.body.appendChild(creatorsOverlay);
}

function bindSettingsLinks() {
    document.querySelectorAll('.js-open-settings').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openSettings();
        });
    });
}

function bindCreatorsLinks() {
    document.querySelectorAll('.js-open-creators').forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openCreators();
        });
    });
}

function initControlBar() {
    if (document.querySelector('.control-bar')) return;

    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEMES[saved]) {
        currentTheme = saved;
    }

    const bar = document.createElement('div');
    bar.className = 'control-bar';

    const gear = document.createElement('button');
    gear.type = 'button';
    gear.className = 'control-bar__gear';
    gear.setAttribute('aria-label', 'تنظیمات');
    gear.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65Z"/></svg>';
    gear.addEventListener('click', openSettings);

    const themeBox = document.createElement('div');
    themeBox.className = 'control-bar__theme theme-picker';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-picker__toggle';
    toggle.setAttribute('aria-label', 'انتخاب رنگ');

    const panel = document.createElement('div');
    panel.className = 'theme-picker__panel';

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        themeBox.classList.toggle('is-open');
        if (themeBox.classList.contains('is-open')) {
            renderThemeSwatches(panel);
        }
    });

    document.addEventListener('click', (e) => {
        if (!themeBox.contains(e.target)) {
            themeBox.classList.remove('is-open');
        }
    });

    themeBox.appendChild(toggle);
    themeBox.appendChild(panel);
    bar.appendChild(gear);
    bar.appendChild(themeBox);
    document.body.appendChild(bar);

    applyTheme(currentTheme);
}

function startApp() {
    initMouseBackground();
    initSettingsModal();
    initCreatorsModal();
    initAudioPlayer();
    initControlBar();
    bindSettingsLinks();
    bindCreatorsLinks();

    window.addEventListener('beforeunload', saveAudioState);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) saveAudioState();
    });

    if (location.pathname.includes('loading.html')) {
        showLoadingScreen();
        const delay = 3700 + Math.random() * 1200;
        setTimeout(() => {
            location.href = getGamePageForLevel(getGameLevel());
        }, delay);
    }

    if (
        location.pathname.includes('game_easy.html') ||
        location.pathname.includes('pro.html') ||
        location.pathname.includes('super_pro.html') ||
        location.pathname.includes('game.html')
    ) {
        showStartOverlay();
    }

    if (location.pathname.includes('leaderboard.html')) {
        renderLeaderboard();
        const adminBtn = document.getElementById('adminLoginBtn');
        if (adminBtn) adminBtn.addEventListener('click', openAdminLogin);
    }

    if (location.pathname.includes('setting')) {
        openSettings();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
