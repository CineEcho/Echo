const axios = require('axios');
const fs = require('fs');

const API_KEY = process.env.TMDB_API_KEY;  // 从环境变量读取 API 密钥

// 请求 URL
const url = `https://api.themoviedb.org/3/movie/550?api_key=${API_KEY}&language=en-US`;

// 请求 TMDB API 获取电影数据
axios.get(url)
  .then(response => {
    // 将数据保存到 JSON 文件
    fs.writeFileSync('./data/movies.json', JSON.stringify(response.data, null, 2));
    console.log('电影数据已保存到 movies.json');
  })
  .catch(error => {
    console.error('抓取失败:', error);
  });