async function loadMovies() {
    try {
        const response = await fetch('movies.json');
        const data = await response.json();
        
        // 将数据转换为符合展示格式的结构
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
        
        updateFilters();
        displayMovies(movies);
    } catch (error) {
        console.error('加载电影数据失败:', error);
    }
}