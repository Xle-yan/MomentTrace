/**
 * MomentTrace - 朋友圈分析应用
 * 前端交互逻辑
 */

// ============================================
// 全局状态
// ============================================
const state = {
    currentPage: 'home',
    uploadedImages: [],
    maxImages: 20,
    minImages: 5,
    isAnalyzing: false,
    analysisResult: null
};

// ============================================
// DOM 元素引用
// ============================================
const elements = {
    // 页面容器
    pages: {
        home: null,
        upload: null,
        loading: null,
        result: null
    },

    // 首页
    startBtn: null,

    // 上传页
    uploadArea: null,
    fileInput: null,
    previewGrid: null,
    imageCount: null,
    analyzeBtn: null,
    analyzeCount: null,
    backToHomeBtn: null,

    // 结果页
    resultContent: null,
    startOverBtn: null,
    backToUploadBtn: null,
    shareBtn: null
};

// ============================================
// 配置常量
// ============================================
const CONFIG = {
    API_ENDPOINT: '/api/analyze',
    SUPPORTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ANALYSIS_TIPS: [
        '正在识别图片中的文字内容...',
        '正在分析朋友圈发布规律...',
        '正在解读兴趣爱好偏好...',
        '正在评估性格特征...',
        '正在生成约会建议...',
        '正在整理分析报告...'
    ]
};

// ============================================
// 工具函数
// ============================================

/**
 * 生成唯一ID
 */
function generateId() {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 文件转 Base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    // 移除已存在的 toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// 初始化
// ============================================

/**
 * DOM 加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * 初始化应用
 */
function init() {
    console.log('MomentTrace 初始化中...');

    // 缓存 DOM 元素
    cacheElements();

    // 绑定事件
    bindEvents();

    // 显示首页
    navigateTo('home');

    console.log('MomentTrace 初始化完成');
}

/**
 * 缓存 DOM 元素引用
 */
function cacheElements() {
    // 页面容器
    elements.pages.home = document.getElementById('page-home');
    elements.pages.upload = document.getElementById('page-upload');
    elements.pages.loading = document.getElementById('page-loading');
    elements.pages.result = document.getElementById('page-result');

    // 首页
    elements.startBtn = document.getElementById('btn-start');

    // 上传页
    elements.uploadArea = document.getElementById('upload-area');
    elements.fileInput = document.getElementById('file-input');
    elements.previewGrid = document.getElementById('preview-grid');
    elements.imageCount = document.getElementById('image-count');
    elements.analyzeBtn = document.getElementById('btn-analyze');
    elements.analyzeCount = document.getElementById('analyze-count');
    elements.backToHomeBtn = document.getElementById('btn-back-home');

    // 结果页
    elements.resultContent = document.getElementById('result-content');
    elements.startOverBtn = document.getElementById('btn-restart');
    elements.backToUploadBtn = document.getElementById('btn-back-upload');
    elements.shareBtn = document.getElementById('btn-share');
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    // 首页 - 开始按钮
    elements.startBtn?.addEventListener('click', () => navigateTo('upload'));

    // 上传页 - 返回按钮
    elements.backToHomeBtn?.addEventListener('click', () => navigateTo('home'));

    // 上传页 - 点击上传区域
    elements.uploadArea?.addEventListener('click', () => elements.fileInput?.click());

    // 上传页 - 文件选择
    elements.fileInput?.addEventListener('change', handleFileSelect);

    // 上传页 - 拖拽事件
    elements.uploadArea?.addEventListener('dragover', handleDragOver);
    elements.uploadArea?.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea?.addEventListener('drop', handleDrop);

    // 上传页 - 粘贴事件
    document.addEventListener('paste', handlePaste);

    // 上传页 - 分析按钮
    elements.analyzeBtn?.addEventListener('click', startAnalysis);

    // 结果页 - 重新开始
    elements.startOverBtn?.addEventListener('click', resetAndStart);

    // 结果页 - 返回上传页
    elements.backToUploadBtn?.addEventListener('click', () => navigateTo('upload'));

    // 结果页 - 分享按钮
    elements.shareBtn?.addEventListener('click', shareResult);
}

// ============================================
// 页面导航
// ============================================

/**
 * 导航到指定页面
 */
function navigateTo(pageName) {
    // 验证页面名称
    if (!elements.pages[pageName]) {
        console.error(`页面不存在: ${pageName}`);
        return;
    }

    // 隐藏所有页面
    Object.values(elements.pages).forEach(page => {
        if (page) {
            page.classList.remove('active');
            page.style.display = 'none';
        }
    });

    // 显示目标页面
    const targetPage = elements.pages[pageName];
    targetPage.style.display = 'block';

    // 触发重排后添加 active 类以启用过渡动画
    requestAnimationFrame(() => {
        targetPage.classList.add('active');
    });

    // 更新状态
    state.currentPage = pageName;

    // 页面切换后的特殊处理
    handlePageEnter(pageName);

    console.log(`导航到: ${pageName}`);
}

/**
 * 页面进入时的特殊处理
 */
function handlePageEnter(pageName) {
    switch (pageName) {
        case 'home':
            break;

        case 'upload':
            updateImageCount();
            updateAnalyzeButton();
            break;

        case 'loading':
            startLoadingTips();
            break;

        case 'result':
            window.scrollTo(0, 0);
            break;
    }
}

/**
 * 更新图片计数显示
 */
function updateImageCount() {
    if (elements.imageCount) {
        const count = state.uploadedImages.length;
        // 只更新数字，与 HTML 结构保持一致
        elements.imageCount.textContent = count;

        if (count >= state.minImages) {
            elements.imageCount.classList.add('sufficient');
            elements.imageCount.classList.remove('insufficient');
        } else {
            elements.imageCount.classList.add('insufficient');
            elements.imageCount.classList.remove('sufficient');
        }
    }

    // 更新分析按钮提示文字
    if (elements.analyzeCount) {
        const count = state.uploadedImages.length;
        if (count >= state.minImages) {
            elements.analyzeCount.textContent = `(${count}张图片)`;
        } else {
            elements.analyzeCount.textContent = `(至少需要${state.minImages}张)`;
        }
    }
}

/**
 * 更新分析按钮状态
 */
function updateAnalyzeButton() {
    if (elements.analyzeBtn) {
        const canAnalyze = state.uploadedImages.length >= state.minImages && !state.isAnalyzing;
        elements.analyzeBtn.disabled = !canAnalyze;

        if (canAnalyze) {
            elements.analyzeBtn.classList.remove('btn-disabled');
        } else {
            elements.analyzeBtn.classList.add('btn-disabled');
        }
    }
}

/**
 * 加载提示轮播
 */
let loadingTipInterval = null;
let currentTipIndex = 0;

function startLoadingTips() {
    const tipElement = document.getElementById('loading-tip');
    if (!tipElement) return;

    currentTipIndex = 0;
    tipElement.textContent = CONFIG.ANALYSIS_TIPS[0];

    if (loadingTipInterval) {
        clearInterval(loadingTipInterval);
    }

    loadingTipInterval = setInterval(() => {
        currentTipIndex = (currentTipIndex + 1) % CONFIG.ANALYSIS_TIPS.length;
        tipElement.style.opacity = '0';

        setTimeout(() => {
            tipElement.textContent = CONFIG.ANALYSIS_TIPS[currentTipIndex];
            tipElement.style.opacity = '1';
        }, 300);
    }, 3000);
}

/**
 * 停止加载提示轮播
 */
function stopLoadingTips() {
    if (loadingTipInterval) {
        clearInterval(loadingTipInterval);
        loadingTipInterval = null;
    }
}

/**
 * 重置并重新开始
 */
function resetAndStart() {
    state.uploadedImages = [];
    state.analysisResult = null;
    state.isAnalyzing = false;

    if (elements.previewGrid) {
        elements.previewGrid.innerHTML = '';
    }

    navigateTo('upload');
}

// ============================================
// 图片上传处理
// ============================================

/**
 * 处理文件选择
 */
function handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        processFiles(Array.from(files));
    }
    event.target.value = '';
}

/**
 * 处理拖拽悬停
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.uploadArea?.classList.add('drag-over');
}

/**
 * 处理拖拽离开
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.uploadArea?.classList.remove('drag-over');
}

/**
 * 处理文件拖放
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.uploadArea?.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        processFiles(Array.from(files));
    }
}

/**
 * 处理粘贴事件
 */
function handlePaste(event) {
    if (state.currentPage !== 'upload') return;

    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                imageFiles.push(file);
            }
        }
    }

    if (imageFiles.length > 0) {
        event.preventDefault();
        processFiles(imageFiles);
        showToast(`已粘贴 ${imageFiles.length} 张图片`, 'success');
    }
}

/**
 * 处理文件列表
 */
async function processFiles(files) {
    const validFiles = files.filter(file => {
        if (!CONFIG.SUPPORTED_TYPES.includes(file.type)) {
            showToast(`不支持的文件格式: ${file.name}`, 'error');
            return false;
        }
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showToast(`文件过大: ${file.name} (最大 10MB)`, 'error');
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) return;

    const remainingSlots = state.maxImages - state.uploadedImages.length;
    if (remainingSlots <= 0) {
        showToast(`最多只能上传 ${state.maxImages} 张图片`, 'warning');
        return;
    }

    const filesToProcess = validFiles.slice(0, remainingSlots);
    if (filesToProcess.length < validFiles.length) {
        showToast(`已达到上限，仅添加了 ${filesToProcess.length} 张图片`, 'warning');
    }

    for (const file of filesToProcess) {
        try {
            const base64 = await fileToBase64(file);
            const imageData = {
                id: generateId(),
                file: file,
                base64: base64,
                name: file.name,
                size: file.size
            };
            state.uploadedImages.push(imageData);
            addPreviewItem(imageData);
        } catch (error) {
            console.error('文件读取失败:', error);
            showToast(`读取失败: ${file.name}`, 'error');
        }
    }

    updateImageCount();
    updateAnalyzeButton();
}

/**
 * 添加预览项
 */
function addPreviewItem(imageData) {
    if (!elements.previewGrid) return;

    const item = document.createElement('div');
    item.className = 'preview-item';
    item.dataset.id = imageData.id;

    item.innerHTML = `
        <img src="${imageData.base64}" alt="${imageData.name}" />
        <button class="preview-remove" onclick="removeImage('${imageData.id}')" title="移除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="preview-info">${formatFileSize(imageData.size)}</div>
    `;

    elements.previewGrid.appendChild(item);

    requestAnimationFrame(() => {
        item.classList.add('show');
    });
}

/**
 * 移除图片
 */
function removeImage(imageId) {
    const index = state.uploadedImages.findIndex(img => img.id === imageId);
    if (index > -1) {
        state.uploadedImages.splice(index, 1);
    }

    const item = document.querySelector(`.preview-item[data-id="${imageId}"]`);
    if (item) {
        item.classList.add('removing');
        setTimeout(() => item.remove(), 300);
    }

    updateImageCount();
    updateAnalyzeButton();
}

// ============================================
// 分析请求
// ============================================

/**
 * 开始分析
 */
async function startAnalysis() {
    if (state.uploadedImages.length < state.minImages) {
        showToast(`请至少上传 ${state.minImages} 张图片`, 'warning');
        return;
    }

    if (state.isAnalyzing) {
        return;
    }

    state.isAnalyzing = true;
    navigateTo('loading');

    try {
        // 准备图片数据
        const images = state.uploadedImages.map(img => img.base64);

        // 发送分析请求
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ images })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || '分析请求失败');
        }

        // 保存分析结果
        state.analysisResult = data.data;

        // 停止加载提示
        stopLoadingTips();

        // 渲染结果
        renderResult(state.analysisResult);

        // 跳转到结果页
        navigateTo('result');

    } catch (error) {
        console.error('分析失败:', error);
        stopLoadingTips();
        showToast(error.message || '分析失败，请稍后重试', 'error');
        navigateTo('upload');
    } finally {
        state.isAnalyzing = false;
    }
}

// ============================================
// 结果渲染
// ============================================

/**
 * 渲染分析结果
 */
function renderResult(result) {
    if (!elements.resultContent || !result) return;

    const { profile, strategy, openers, compatibility } = result;

    elements.resultContent.innerHTML = `
        <!-- 人物画像概要 -->
        <div class="result-card profile-summary">
            <div class="card-header">
                <span class="card-icon">✦</span>
                <h3>人物画像</h3>
            </div>
            <p class="summary-text">${profile.summary}</p>
            ${profile.personality.mbtiGuess ? `<span class="mbti-badge">${profile.personality.mbtiGuess}</span>` : ''}
        </div>

        <!-- 性格特征雷达图 -->
        <div class="result-card personality-card">
            <div class="card-header">
                <span class="card-icon">📊</span>
                <h3>性格特征</h3>
            </div>
            <div class="radar-chart-container">
                <canvas id="radar-chart" width="280" height="280"></canvas>
            </div>
            <div class="personality-traits">
                ${profile.personality.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
            </div>
        </div>

        <!-- 兴趣爱好 -->
        <div class="result-card interests-card">
            <div class="card-header">
                <span class="card-icon">💫</span>
                <h3>兴趣爱好</h3>
            </div>
            <div class="interest-tags">
                ${profile.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
            </div>
        </div>

        <!-- 生活方式 -->
        <div class="result-card lifestyle-card">
            <div class="card-header">
                <span class="card-icon">🌟</span>
                <h3>生活方式</h3>
            </div>
            <p class="lifestyle-desc">${profile.lifestyle.description}</p>
            <div class="lifestyle-details">
                <div class="detail-item">
                    <span class="detail-label">作息习惯</span>
                    <span class="detail-value">${profile.lifestyle.schedule}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">社交圈</span>
                    <span class="detail-value">${profile.lifestyle.socialCircle}</span>
                </div>
            </div>
        </div>

        <!-- 情感状态 -->
        <div class="result-card emotional-card">
            <div class="card-header">
                <span class="card-icon">💕</span>
                <h3>情感状态</h3>
            </div>
            <div class="emotional-status">
                <div class="status-item">
                    <span class="status-label">单身可能性</span>
                    <span class="status-value probability-${profile.emotionalStatus.singleProbability.toLowerCase()}">${profile.emotionalStatus.singleProbability}</span>
                </div>
            </div>
            <p class="emotional-needs">${profile.emotionalStatus.emotionalNeeds}</p>
        </div>

        <!-- 价值观 -->
        <div class="result-card values-card">
            <div class="card-header">
                <span class="card-icon">🎯</span>
                <h3>价值观</h3>
            </div>
            <div class="value-tags">
                ${profile.values.map(value => `<span class="value-tag">${value}</span>`).join('')}
            </div>
        </div>

        <!-- 语言风格 -->
        <div class="result-card language-card">
            <div class="card-header">
                <span class="card-icon">💬</span>
                <h3>语言风格</h3>
            </div>
            <p class="language-style">${profile.languageStyle}</p>
        </div>

        <!-- 追求策略 -->
        <div class="result-card strategy-card">
            <div class="card-header">
                <span class="card-icon">💡</span>
                <h3>追求策略</h3>
            </div>

            <div class="strategy-section">
                <h4>推荐话题</h4>
                <ul class="strategy-list">
                    ${strategy.commonTopics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>

            <div class="strategy-section">
                <h4>约会建议</h4>
                <ul class="strategy-list">
                    ${strategy.dateIdeas.map(idea => `<li>${idea}</li>`).join('')}
                </ul>
            </div>

            <div class="strategy-section">
                <h4>沟通技巧</h4>
                <ul class="strategy-list">
                    ${strategy.communicationTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>

            <div class="strategy-section warnings">
                <h4>⚠️ 注意事项</h4>
                <ul class="strategy-list warning-list">
                    ${strategy.warnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
            </div>
        </div>

        <!-- 开场白推荐 -->
        <div class="result-card openers-card">
            <div class="card-header">
                <span class="card-icon">💌</span>
                <h3>开场白推荐</h3>
            </div>
            <div class="openers-list">
                ${openers.map(opener => `
                    <div class="opener-item">
                        <span class="opener-style">${opener.style}</span>
                        <p class="opener-text">${opener.text}</p>
                        <button class="copy-btn" onclick="copyToClipboard('${escapeForJs(opener.text)}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            复制
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 匹配分析 -->
        <div class="result-card compatibility-card">
            <div class="card-header">
                <span class="card-icon">🤝</span>
                <h3>匹配分析</h3>
            </div>
            <div class="compatibility-section">
                <h4>潜在契合点</h4>
                <ul class="compatibility-list strengths">
                    ${compatibility.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            <div class="compatibility-section">
                <h4>可能的挑战</h4>
                <ul class="compatibility-list challenges">
                    ${compatibility.challenges.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        </div>

        ${result._notice ? `<p class="notice">${result._notice}</p>` : ''}
    `;

    // 绘制雷达图
    setTimeout(() => {
        drawRadarChart(profile.personality.scores);
    }, 100);
}

/**
 * 转义 JS 字符串
 */
function escapeForJs(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
    } catch (error) {
        console.error('复制失败:', error);
        showToast('复制失败', 'error');
    }
}

// ============================================
// 雷达图绘制
// ============================================

/**
 * 绘制性格雷达图
 */
function drawRadarChart(scores) {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 数据准备
    const labels = ['外向性', '理性', '开放性', '亲和力', '尽责性'];
    const values = [
        scores.extroversion,
        scores.rationality,
        scores.openness,
        scores.agreeableness,
        scores.conscientiousness
    ];
    const numPoints = labels.length;
    const angleStep = (Math.PI * 2) / numPoints;

    // 绘制背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let level = 1; level <= 5; level++) {
        const levelRadius = (radius * level) / 5;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + levelRadius * Math.cos(angle);
            const y = centerY + levelRadius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 绘制轴线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
        ctx.stroke();
    }

    // 绘制数据区域
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = values[i] / 100;
        const x = centerX + radius * value * Math.cos(angle);
        const y = centerY + radius * value * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制数据点
    ctx.fillStyle = '#a855f7';
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = values[i] / 100;
        const x = centerX + radius * value * Math.cos(angle);
        const y = centerY + radius * value * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius + 25;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        ctx.fillText(labels[i], x, y);
    }
}

// ============================================
// 分享功能
// ============================================

/**
 * 分享结果
 */
async function shareResult() {
    if (!state.analysisResult) {
        showToast('暂无分析结果可分享', 'warning');
        return;
    }

    const shareText = generateShareText(state.analysisResult);

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'MomentTrace 分析报告',
                text: shareText
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                await copyToClipboard(shareText);
            }
        }
    } else {
        await copyToClipboard(shareText);
    }
}

/**
 * 生成分享文本
 */
function generateShareText(result) {
    const { profile, strategy } = result;
    return `【MomentTrace 分析报告】

📝 人物画像：${profile.summary}

🎭 性格特征：${profile.personality.traits.join('、')}
${profile.personality.mbtiGuess ? `📊 MBTI：${profile.personality.mbtiGuess}` : ''}

💫 兴趣爱好：${profile.interests.join('、')}

💡 追求建议：
${strategy.commonTopics.slice(0, 3).map(t => `• ${t}`).join('\n')}

—— 由 MomentTrace 生成`;
}
