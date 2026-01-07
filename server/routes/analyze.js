const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// 分析朋友圈截图
router.post('/analyze', async (req, res) => {
  try {
    const { images } = req.body;

    // 验证图片数量
    if (!images || !Array.isArray(images) || images.length < 5) {
      return res.status(400).json({
        success: false,
        message: '请上传至少5张朋友圈截图'
      });
    }

    if (images.length > 20) {
      return res.status(400).json({
        success: false,
        message: '最多支持上传20张图片'
      });
    }

    // 调用 AI 服务进行分析
    const result = await aiService.analyzeImages(images);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('分析失败:', error);
    res.status(500).json({
      success: false,
      message: '分析失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MomentTrace API 运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
