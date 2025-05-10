// script.js

// API密钥配置
let API_KEY;

// 尝试从不同环境获取API密钥
async function initApiKey() {
    try {
        console.log('开始初始化API密钥...');
        console.log('window.TMDB_API_KEY:', window.TMDB_API_KEY);
        
        // 从window对象获取API密钥
        if (window.TMDB_API_KEY) {
            API_KEY = window.TMDB_API_KEY;
            console.log('成功加载API密钥:', API_KEY);
            return true;
        }

        // 如果无法获取API密钥，显示错误信息
        throw new Error('无法获取API密钥，请确保已正确配置环境变量');
    } catch (error) {
        console.error('初始化API密钥失败:', error);
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '<p class="error">无法加载API密钥，请检查环境配置</p>';
        return false;
    }
}

// 当前筛选条件
let filters = {
    category: '电影',
    genre: '全部',
    region: '全部',
    year: '全部'
};

// 存储用户评分
let userRatings = new Map();

// 评分数据
const defaultRatings = {
    ratings: [
        { id: 550, rating: 3 },
        { id: 500, rating: 2 },
        { id: 600, rating: 1 }
    ]
};

// 加载用户评分
async function loadUserRatings() {
    try {
        console.log('开始加载用户评分...');
        const response = await fetch('data/ratings.json');
        console.log('ratings.json响应状态:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('加载到的评分数据:', data);
        
        // 清空现有评分
        userRatings.clear();
        
        // 加载新评分
        data.ratings.forEach(item => {
            if (item.id && item.rating >= 1 && item.rating <= 10) {
                userRatings.set(item.id, item.rating);
                console.log(`添加评分: ID=${item.id}, 评分=${item.rating}`);
            }
        });
        
        console.log('已加载用户评分:', userRatings);
        return true;
    } catch (error) {
        console.error('加载用户评分失败:', error);
        // 如果加载失败，使用默认评分
        userRatings.clear();
        defaultRatings.ratings.forEach(item => {
            userRatings.set(item.id, item.rating);
            console.log(`使用默认评分: ID=${item.id}, 评分=${item.rating}`);
        });
        console.log('使用默认评分:', userRatings);
        return false;
    }
}

// 带重试的fetch请求
async function fetchWithRetry(url, options = {}, retries = 3, timeout = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`请求失败，正在重试 (${i + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// 获取单个作品详情
async function getMovieDetails(id) {
    try {
        const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=zh-CN`;
        const response = await fetchWithRetry(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error(`获取作品 ${id} 详情失败:`, error);
        return null;
    }
}

// 显示作品详情
function showMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details');
    const movieList = document.getElementById('movie-list');
    
    detailsContainer.style.display = 'block';
    movieList.style.display = 'none';
    
    detailsContainer.innerHTML = `
        <div class="movie-detail">
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}">
            <h2>${movie.title}</h2>
            <p>TMDB评分: ${movie.vote_average}</p>
            <p>我的评分: ${userRatings.get(movie.id) || '未评分'}</p>
            <p>上映日期: ${movie.release_date}</p>
            <p>简介: ${movie.overview}</p>
            <button onclick="backToList()">返回列表</button>
        </div>
    `;
}

// 返回列表
function backToList() {
    const detailsContainer = document.getElementById('movie-details');
    const movieList = document.getElementById('movie-list');
    
    detailsContainer.style.display = 'none';
    movieList.style.display = 'block';
}

// 初始化筛选状态
function initFilters() {
    console.log('初始化筛选器...');
    document.querySelectorAll('.filter-group').forEach(group => {
        const filterType = group.dataset.filter;
        console.log(`处理筛选组: ${filterType}`);
        const buttons = group.querySelectorAll('button');
        buttons.forEach(button => {
            // 设置默认选中第一项
            if (button.textContent === filters[filterType]) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                console.log(`点击了筛选按钮: ${button.textContent}`);
                // 更新筛选条件
                filters[filterType] = button.textContent;
                console.log('当前筛选条件:', filters);

                // 切换active类
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // 刷新电影列表
                renderMovies();
            });
        });
    });
}

// 检查网络连接
async function checkNetworkConnection() {
    try {
        const response = await fetch('https://api.themoviedb.org/3/configuration?api_key=' + API_KEY, {
            method: 'HEAD',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        console.error('网络连接检查失败:', error);
        return false;
    }
}

// 渲染电影列表
async function renderMovies() {
    try {
        console.log('开始获取电影数据...');
        const movies = [
            { id: 'tt0137523', title: '搏击俱乐部' },
            { id: 'tt0133093', title: '黑客帝国' },
            { id: 'tt0076759', title: '星球大战' }
        ];

        const container = document.getElementById('movies-container');
        if (!container) {
            throw new Error('找不到电影容器元素');
        }

        // 清空容器
        container.innerHTML = '';

        for (const movie of movies) {
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
                attempts++;
                try {
                    console.log(`获取电影详情 (尝试 ${attempts}/${maxAttempts}): ${movie.id}`);
                    const response = await fetch(`/api/movie/${movie.id}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log(`成功获取电影 ${movie.id} 的数据:`, data);
                    
                    // 处理电影数据
                    const movieElement = document.createElement('div');
                    movieElement.className = 'movie-card';
                    const userRating = userRatings.get(movie.id) || '未评分';
                    movieElement.innerHTML = `
                        <div class="poster-container">
                            <img src="${data.Poster}" alt="${data.Title}">
                            <div class="user-rating">${userRating}</div>
                        </div>
                        <h3>${data.Title}</h3>
                    `;
                    container.appendChild(movieElement);
                    break;
                } catch (error) {
                    console.error(`获取电影 ${movie.id} 失败 (尝试 ${attempts}/${maxAttempts}):`, error);
                    if (attempts < maxAttempts) {
                        console.log('等待重试...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else {
                        console.error(`电影 ${movie.id} 获取失败，已达到最大重试次数`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('渲染电影时出错:', error);
        const container = document.getElementById('movies-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>加载电影数据失败</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// 初始化应用
async function initApp() {
    try {
        console.log('开始初始化应用...');
        
        // 加载用户评分
        console.log('加载用户评分...');
        const ratingsLoaded = await loadUserRatings();
        if (!ratingsLoaded) {
            console.warn('使用默认评分数据');
        }

        // 初始化筛选器
        console.log('初始化筛选器...');
        initFilters();
        
        // 获取电影数据
        console.log('获取电影数据...');
        await renderMovies();
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        const container = document.getElementById('movies-container');
        if (container) {
            container.innerHTML = `<div class="error-message">
                <p>初始化失败: ${error.message}</p>
            </div>`;
        }
    }
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM加载完成，开始初始化应用...');
        initApp();
    });
} else {
    console.log('DOM已加载，直接初始化应用...');
    initApp();
}