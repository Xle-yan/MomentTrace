# MomentTrace - 朋友圈分析助手

一款基于 AI 的 H5 网页应用，通过分析目标对象的朋友圈截图，帮助用户深入了解对方的性格、兴趣、生活方式等特征，为用户提供社交建议。

## 功能特性

- **图片上传**：支持点击、拖拽、粘贴多种上传方式
- **AI 智能分析**：基于豆包大模型深度分析朋友圈内容
- **人物画像**：生成目标对象的性格、兴趣、生活方式等综合画像
- **追求策略**：提供话题推荐、约会建议、沟通技巧等实用建议
- **开场白生成**：提供多种风格的开场白模板，支持一键复制

## 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript
- **后端**：Node.js + Express
- **AI 模型**：豆包大模型 doubao-seed-1.6-thinking
- **视觉风格**：高级感深色主题

## 项目结构

```
MomentTrace/
├── public/                 # 前端静态资源
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   ├── js/
│   │   └── app.js         # 前端逻辑
│   └── images/            # 图片资源目录
├── server/                 # 后端服务
│   ├── index.js           # 服务入口
│   ├── routes/
│   │   └── analyze.js     # 分析路由
│   └── services/
│       └── aiService.js   # AI 服务
├── .env.example           # 环境变量示例
├── .gitignore             # Git 忽略规则
├── package.json           # 项目配置
├── PRD.md                 # 产品需求文档
└── README.md              # 项目说明
```

## 文件说明

### 前端文件

| 文件 | 说明 |
|------|------|
| `public/index.html` | 应用主页面，包含首页、上传页、加载页、结果页四个页面容器，采用单页应用模式 |
| `public/css/style.css` | 全局样式文件，包含 CSS 变量系统、深色主题配色、组件样式、动画效果、响应式适配 |
| `public/js/app.js` | 前端核心逻辑，包含状态管理、页面导航、图片上传处理、API 调用、结果渲染、雷达图绘制等功能 |

### 后端文件

| 文件 | 说明 |
|------|------|
| `server/index.js` | Express 服务入口，配置中间件（CORS、JSON 解析）、静态文件服务、API 路由、全局错误处理 |
| `server/routes/analyze.js` | 分析 API 路由，处理 `/api/analyze` 和 `/api/health` 端点，验证图片数量（5-20张） |
| `server/services/aiService.js` | AI 服务封装，调用豆包大模型 API 进行图片分析，包含系统提示词和模拟数据（开发模式） |

### 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目配置，定义依赖（express、cors、dotenv、openai）和启动脚本 |
| `.env.example` | 环境变量模板，包含 API Key、端点 ID、端口等配置项 |
| `.gitignore` | Git 忽略规则，排除 node_modules、.env、日志文件等 |
| `PRD.md` | 产品需求文档，详细描述功能需求、技术方案、页面设计 |

## 快速开始

### 1. 安装依赖

```bash
cd MomentTrace
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 API 凭证：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 豆包 API 密钥
ARK_API_KEY=your-api-key-here

# 推理接入点 ID
ARK_ENDPOINT_ID=your-endpoint-id-here

# 服务端口
PORT=3000

# 运行环境
NODE_ENV=development
```

### 3. 获取 API 凭证

1. 访问 [火山引擎官网](https://www.volcengine.com/) 注册账号
2. 完成实名认证
3. 进入 [火山方舟控制台](https://console.volcengine.com/ark)
4. 创建推理接入点，选择 `doubao-seed-1.6-thinking` 模型
5. 获取 API Key 和推理接入点 ID

### 4. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

### 5. 访问应用

打开浏览器访问 `http://localhost:3000`

## 使用说明

### 第一步：准备截图

- 从微信朋友圈截取目标对象的动态截图
- 建议截取 5-20 张，内容越丰富分析越准确
- 支持 JPG、PNG、WEBP 格式，单张最大 10MB

### 第二步：上传图片

1. 点击「开始分析」进入上传页面
2. 通过以下方式上传截图：
   - **点击上传**：点击上传区域选择文件
   - **拖拽上传**：将图片拖入上传区域
   - **粘贴上传**：直接 Ctrl+V 粘贴剪贴板中的图片
3. 上传后可预览和删除图片

### 第三步：开始分析

- 上传至少 5 张图片后，点击「开始分析」
- AI 将识别图片中的文字内容并进行深度分析
- 分析过程约需 10-30 秒

### 第四步：查看报告

分析完成后，你将看到以下内容：

- **人物画像**：一句话概括 + MBTI 类型推测
- **性格特征**：五维雷达图 + 性格标签
- **兴趣爱好**：识别出的兴趣点
- **生活方式**：作息习惯、社交圈特点
- **情感状态**：单身可能性、情感需求
- **价值观**：核心价值观标签
- **语言风格**：文字表达特点分析
- **追求策略**：话题推荐、约会建议、沟通技巧、注意事项
- **开场白推荐**：多种风格的开场白（可一键复制）
- **匹配分析**：潜在契合点和可能的挑战

## 开发模式

未配置 API Key 时，应用会返回模拟数据，方便前端开发调试。

## API 接口

### 分析接口

**请求**
```
POST /api/analyze
Content-Type: application/json

{
  "images": ["data:image/jpeg;base64,...", ...]
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "strategy": { ... },
    "openers": [ ... ],
    "compatibility": { ... }
  }
}
```

### 健康检查

```
GET /api/health
```

## 隐私说明

- 图片仅用于分析，不做服务器存储
- API Key 不暴露在前端
- 用户数据本地存储，不上传云端

## 注意事项

- 分析结果仅供参考，请理性看待
- 请尊重他人隐私，合理使用本工具
- 建议在良好网络环境下使用

## License

MIT
