// 初始化电影数据
let movies = [];  // 只声明一次

// 加载电影数据
async function loadMovies() {
    try {
        const response = await fetch('data/movies.json');  // 从 data 文件夹中的 movies.json 文件加载数据
        const data = await response.json();
        
        console.log(data);  // 输出 data，检查它的类型

        if (Array.isArray(data)) {
            // 格式化电影数据
            const formattedMovies = data.map(movie => ({
                id: movie.id,
                title: movie.original_title,  // 使用英文原名
                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, // 构建海报的完整URL
                rating: movie.vote_average,  // 评分
                year: movie.release_date.split('-')[0],  // 获取年份
                genre: movie.genres.map(g => g.name),  // 提取所有类别
                country: movie.production_countries.map(c => c.name).join(', '),  // 电影制作国家
            }));

            // 将转换后的数据推入 movies 数组
            movies.push(...formattedMovies);

            updateFilters();  // 更新筛选条件
            displayMovies(movies);  // 显示电影
        } else {
            console.error("电影数据不是一个数组，无法格式化");
        }
    } catch (error) {
        console.error('加载电影数据失败:', error);
    }
}

// 显示电影列表
function displayMovies(list) {
    const container = document.getElementById('movie-list');
    container.innerHTML = list.map(movie => `
        <div class="movie-card">
            <img src="${movie.poster}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>评分: ${movie.rating}</p>
            <button onclick="viewDetails('${movie.id}')">查看详情</button>
        </div>
    `).join('');
}

// 查看电影详情
function viewDetails(id) {
    location.href = `details.html?id=${id}`;
}

// 更新筛选条件
function updateFilters() {
    const years = new Set();
    const countries = new Set();
    const genres = new Set();
    const ratings = new Set();

    movies.forEach(movie => {
        years.add(movie.year);
        countries.add(movie.country);
        movie.genre.forEach(g => genres.add(g));
        ratings.add(movie.rating);
    });

    setOptions('yearFilter', years);
    setOptions('countryFilter', countries);
    setOptions('genreFilter', genres);
    setOptions('ratingFilter', ratings);
}

// 设置筛选选项
function setOptions(id, values) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">全部</option>';
    Array.from(values).sort().forEach(value => {
        select.innerHTML += `<option value="${value}">${value}</option>`;
    });
}

// 搜索电影
function searchMovies() {
    const keyword = document.getElementById('search').value.trim().toLowerCase();
    const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(keyword) ||
        movie.genre.some(g => g.toLowerCase().includes(keyword)) ||
        movie.country.toLowerCase().includes(keyword) ||
        movie.year.includes(keyword) ||
        movie.rating.includes(keyword)
    );
    displayMovies(filtered);
}

// 筛选电影
function applyFilters() {
    const year = document.getElementById('yearFilter').value;
    const country = document.getElementById('countryFilter').value;
    const genre = document.getElementById('genreFilter').value;
    const rating = document.getElementById('ratingFilter').value;

    const filtered = movies.filter(movie => {
        return (!year || movie.year == year) &&
               (!country || movie.country == country) &&
               (!genre || movie.genre.includes(genre)) &&
               (!rating || movie.rating == rating);
    });

    displayMovies(filtered);
}

// 加载数据
loadMovies();
