// script.js

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

// 初始化筛选状态
function initFilters() {
    document.querySelectorAll('.filter-group').forEach(group => {
        const filterType = group.dataset.filter;
        const buttons = group.querySelectorAll('button');
        buttons.forEach(button => {
            // 设置默认选中第一项
            if (button.textContent === filters[filterType]) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                // 更新筛选条件
                filters[filterType] = button.textContent === '全部' ? null : button.textContent;

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
    // 根据筛选条件获取电影数据
    // 这里需要根据您的实际API调用逻辑来编写
    // 以下为示例代码，需要您根据实际情况进行调整
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=zh-CN`;
    for (const [key, value] of Object.entries(filters)) {
        if (value && value !== '全部') {
            url += `&${key}=${encodeURIComponent(value)}`;
        }
    }
    const response = await fetch(url);
    const data = await response.json();
    const movies = data.results;

    // 清空当前电影列表
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '';

    // 遍历电影数据，创建电影卡片
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>评分: ${movie.vote_average}</p>
        `;
        movieList.appendChild(movieCard);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    renderMovies();
});
