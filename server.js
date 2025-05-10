const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, '.')));

// OMDB API 密钥
const OMDB_API_KEY = '4a3b711b'; // 这是一个免费的API密钥

// 电影数据获取路由
app.get('/api/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const response = await fetch(`http://www.omdbapi.com/?i=${movieId}&apikey=${OMDB_API_KEY}&plot=full`);
        const data = await response.json();
        
        if (data.Error) {
            throw new Error(data.Error);
        }
        
        res.json(data);
    } catch (error) {
        console.error('获取电影数据失败:', error);
        res.status(500).json({ error: '获取电影数据失败' });
    }
});

// 电影搜索路由
app.get('/api/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const response = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Error) {
            throw new Error(data.Error);
        }
        
        res.json(data);
    } catch (error) {
        console.error('搜索电影失败:', error);
        res.status(500).json({ error: '搜索电影失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 