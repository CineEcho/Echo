// API配置
window.API_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    PROXY_URL: '/api/tmdb', // 代理服务器地址
    USE_PROXY: true // 是否使用代理
};

// 获取API URL
window.getApiUrl = function(path) {
    if (window.API_CONFIG.USE_PROXY) {
        return `${window.API_CONFIG.PROXY_URL}${path}`;
    }
    return `${window.API_CONFIG.BASE_URL}${path}`;
};

// 获取图片URL
window.getImageUrl = function(path) {
    if (window.API_CONFIG.USE_PROXY) {
        return `${window.API_CONFIG.PROXY_URL}/image${path}`;
    }
    return `${window.API_CONFIG.IMAGE_BASE_URL}${path}`;
}; 