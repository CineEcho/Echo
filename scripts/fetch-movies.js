const axios = require('axios');
const fs = require('fs');

// 从环境变量读取 TMDB API 密钥
const API_KEY = process.env.TMDB_API_KEY;

// 示例电影ID列表（你可以根据需要更改或动态加载）
const movieIds = [550, 299534, 330457, 299536]; // 示例电影ID

// 保存所有电影数据的数组
const allMoviesData = [];

// 函数：抓取单个电影的详细信息
async function fetchMovieDetails(movieId) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=zh-CN`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`抓取电影ID ${movieId} 失败:`, error);
    return null;
  }
}

// 批量抓取电影数据
async function fetchMovies() {
  for (let movieId of movieIds) {
    const movieData = await fetchMovieDetails(movieId);
    if (movieData) {
      allMoviesData.push(movieData);
    }
  }

  // 将所有电影数据保存到 JSON 文件
  fs.writeFileSync('./data/movies.json', JSON.stringify(allMoviesData, null, 2));
  console.log('所有电影数据已保存到 movies.json');
}

// 运行批量抓取电影数据
fetchMovies();
