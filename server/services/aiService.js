const OpenAI = require('openai');

// 初始化豆包 API 客户端
const client = new OpenAI({
  apiKey: process.env.ARK_API_KEY || '42acdd22-8e19-4e94-b424-12e074c3ef89',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
});

// 系统提示词
const SYSTEM_PROMPT = `你是一位专业的社交心理分析师和恋爱顾问，擅长通过朋友圈内容分析一个人的性格、兴趣和生活方式。

用户会上传目标对象的朋友圈截图，请你：

1. **仔细识别图片中的所有文字内容**（OCR），包括：
   - 朋友圈发布的文案
   - 图片中的文字
   - 评论和点赞信息
   - 发布时间

2. **综合分析后，输出以下内容**（使用 JSON 格式）：

{
  "profile": {
    "summary": "一句话概括这个人",
    "personality": {
      "traits": ["性格特点1", "性格特点2", ...],
      "mbtiGuess": "推测的MBTI类型",
      "scores": {
        "extroversion": 0-100,
        "rationality": 0-100,
        "openness": 0-100,
        "agreeableness": 0-100,
        "conscientiousness": 0-100
      }
    },
    "interests": ["兴趣1", "兴趣2", ...],
    "lifestyle": {
      "description": "生活方式描述",
      "schedule": "作息推测",
      "socialCircle": "社交圈特点"
    },
    "emotionalStatus": {
      "singleProbability": "高/中/低",
      "emotionalNeeds": "情感需求分析"
    },
    "values": ["价值观1", "价值观2", ...],
    "languageStyle": "语言风格分析"
  },
  "strategy": {
    "commonTopics": ["推荐话题1", "推荐话题2", ...],
    "dateIdeas": ["约会建议1", "约会建议2", ...],
    "communicationTips": ["沟通技巧1", "沟通技巧2", ...],
    "warnings": ["注意事项1", "注意事项2", ...]
  },
  "openers": [
    {
      "style": "风格名称（如：幽默型、真诚型、好奇型）",
      "text": "开场白内容"
    }
  ],
  "compatibility": {
    "strengths": ["潜在契合点1", "潜在契合点2", ...],
    "challenges": ["可能的挑战1", "可能的挑战2", ...]
  }
}

注意：
- 分析要客观、专业，避免过度主观臆断
- 给出的建议要具体、可操作
- 开场白要自然、有趣，不要油腻
- 如果信息不足，可以标注"信息不足，仅供参考"
- 请直接输出 JSON，不要有其他内容`;

/**
 * 分析朋友圈截图
 * @param {string[]} images - Base64 编码的图片数组
 * @returns {Promise<object>} 分析结果
 */
async function analyzeImages(images) {
  // 检查 API 配置
  if (!process.env.ARK_API_KEY || process.env.ARK_API_KEY === 'your-api-key-here') {
    // 返回模拟数据（开发模式）
    console.log('警告: 未配置 API Key，返回模拟数据');
    return getMockResult();
  }

  // 构建消息内容
  const userContent = [
    {
      type: 'text',
      text: `请分析以下 ${images.length} 张朋友圈截图，识别其中的文字内容，并给出完整的人物分析和追求建议。`
    }
  ];

  // 添加图片
  for (const image of images) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
      }
    });
  }

  try {
    const response = await client.chat.completions.create({
      model: process.env.ARK_ENDPOINT_ID || 'your-endpoint-id-here',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ],
      max_tokens: 4096,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    // 解析 JSON 响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI 响应内容:', content);
      throw new Error('AI 响应中未找到有效的 JSON 数据');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError.message);
      console.error('原始 JSON 字符串:', jsonMatch[0].substring(0, 500) + '...');
      throw new Error(`JSON 解析失败: ${parseError.message}`);
    }

  } catch (error) {
    console.error('AI 分析错误:', error);
    throw error;
  }
}

/**
 * 获取模拟分析结果（开发测试用）
 */
function getMockResult() {
  return {
    profile: {
      summary: "一个热爱生活、积极向上的都市青年，注重生活品质，喜欢探索新事物",
      personality: {
        traits: ["开朗外向", "富有好奇心", "注重细节", "有审美品味", "略带文艺气息"],
        mbtiGuess: "ENFP",
        scores: {
          extroversion: 75,
          rationality: 45,
          openness: 85,
          agreeableness: 70,
          conscientiousness: 60
        }
      },
      interests: ["旅行", "美食探店", "摄影", "咖啡", "电影", "阅读"],
      lifestyle: {
        description: "喜欢周末探店、偶尔旅行，工作日保持规律作息，注重工作与生活的平衡",
        schedule: "工作日朝九晚六，周末活动丰富",
        socialCircle: "有稳定的朋友圈，社交活动适中，既有独处时光也有聚会"
      },
      emotionalStatus: {
        singleProbability: "高",
        emotionalNeeds: "渴望有共同话题和生活理念的伴侣，希望被理解和欣赏"
      },
      values: ["追求生活品质", "重视个人成长", "珍惜朋友和家人", "相信努力会有回报"],
      languageStyle: "文字表达细腻，喜欢用emoji，偶尔引用歌词或书摘，有一定的文学素养"
    },
    strategy: {
      commonTopics: [
        "最近有什么好看的电影推荐",
        "你去过的最喜欢的旅行目的地",
        "发现了一家很棒的咖啡店/餐厅",
        "最近在读什么书",
        "周末一般怎么安排"
      ],
      dateIdeas: [
        "一起去新开的网红咖啡店打卡",
        "周末去郊区来一次轻徒步",
        "找一家有氛围的餐厅吃晚餐",
        "一起看一场口碑好的电影",
        "逛逛有特色的市集或展览"
      ],
      communicationTips: [
        "聊天时多表达真诚的好奇心，对TA分享的内容给予具体回应",
        "可以分享自己相似的经历或爱好，建立共鸣",
        "适当使用轻松幽默的语气，但避免过度玩笑",
        "尊重TA的个人空间，不要过于频繁发消息",
        "记住TA提过的细节，在后续聊天中自然带出"
      ],
      warnings: [
        "避免一开始就问太私人的问题",
        "不要表现得过于殷勤或讨好",
        "聊天不要只聊自己，要有来有往",
        "避免负能量或抱怨类话题",
        "不要急于表白或推进关系"
      ]
    },
    openers: [
      {
        style: "好奇型",
        text: "看到你去了XX（地点），那边是不是真的像网上说的那么美？一直想去但还没找到机会"
      },
      {
        style: "共鸣型",
        text: "你也喜欢XX（电影/书/歌手）！这个真的很小众，难得遇到同好"
      },
      {
        style: "幽默型",
        text: "你拍的照片构图也太好了，是不是有什么拍照秘诀可以传授一下？我拍的永远是游客照水平"
      },
      {
        style: "真诚型",
        text: "冒昧打扰一下，看到你分享的XX觉得很有意思，想认识一下可以吗？"
      }
    ],
    compatibility: {
      strengths: [
        "都注重生活品质，有共同的价值观基础",
        "兴趣爱好有交集，不愁没有话题",
        "对方性格开朗，沟通应该会比较顺畅"
      ],
      challenges: [
        "需要展现自己有趣的一面来吸引注意",
        "对方可能社交圈较广，需要耐心建立独特性",
        "要找到合适的时机和节奏推进关系"
      ]
    },
    _notice: "当前为模拟数据，请配置 API Key 后获取真实分析结果"
  };
}

module.exports = {
  analyzeImages
};
