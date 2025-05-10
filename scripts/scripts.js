// script.js

// 请替换为您的TMDB API密钥
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// 当前筛选条件
let filters = {
    category: '电影',
    genre: '全部',
    region: '全部',
    year: '全部'
};

// 存储用户评分
let userRatings = new Map();

// 读取用户评分
async function loadUserRatings() {
    try {
        // 尝试从JSON文件加载
        const response = await fetch('data/ratings.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 清空现有评分
        userRatings.clear();
        
        // 加载新评分
        data.ratings.forEach(item => {
            if (item.id && item.rating >= 1 && item.rating <= 10) {
                userRatings.set(item.id, item.rating);
            }
        });
        
        console.log('已加载用户评分:', userRatings);
    } catch (error) {
        console.error('加载用户评分失败:', error);
        // 如果加载失败，使用默认评分
        userRatings.clear();
        userRatings.set(550, 3);
        userRatings.set(500, 2);
        userRatings.set(600, 1);
        console.log('使用默认评分:', userRatings);
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

// 渲染电影列表
async function renderMovies() {
    try {
        console.log('开始获取电影数据...');
        // 构建API URL
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=zh-CN`;
        
        // 添加筛选条件
        if (filters.category !== '全部') {
            // 根据类别选择不同的API端点
            if (filters.category === '剧集') {
                url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=zh-CN`;
            } else if (filters.category === '动漫') {
                url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=zh-CN&with_genres=16`;
            }
        }
        
        if (filters.genre !== '全部') {
            // 这里需要添加类型ID映射
            const genreMap = {
                '喜剧': 35,
                '爱情': 10749,
                '恐怖': 27,
                '动作': 28,
                '科幻': 878,
                '剧情': 18,
                '犯罪': 80,
                '奇幻': 14,
                '悬疑': 9648,
                '惊悚': 53,
                '家庭': 10751,
                '冒险': 12,
                '同性': 10770,
                '运动': 10751,
                '战争': 10752,
                '灾难': 878
            };
            if (genreMap[filters.genre]) {
                url += `&with_genres=${genreMap[filters.genre]}`;
            }
        }
        
        if (filters.region !== '全部') {
            url += `&with_origin_country=${filters.region}`;
        }
        
        if (filters.year !== '全部') {
            url += `&primary_release_year=${filters.year}`;
        }

        console.log('请求URL:', url);
        const response = await fetchWithRetry(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API响应状态:', response.status);
        const data = await response.json();
        console.log('获取到的数据:', data);

        if (!data.results) {
            throw new Error('API返回数据格式不正确');
        }

        const movies = data.results;

        // 清空当前电影列表
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '';

        // 遍历电影数据，创建电影卡片
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title || movie.name}">
                <h3>${movie.title || movie.name}</h3>
                ${userRatings.has(movie.id) ? `<div class="rating">⭐ ${userRatings.get(movie.id)}</div>` : ''}
            `;
            
            // 添加点击事件
            movieCard.addEventListener('click', () => {
                showMovieDetails(movie);
            });
            
            movieList.appendChild(movieCard);
        });
    } catch (error) {
        console.error('获取电影数据失败:', error);
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '<p class="error">获取数据失败，请稍后重试</p>';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('页面加载完成，开始初始化...');
    await loadUserRatings();
    initFilters();
    renderMovies();
});
