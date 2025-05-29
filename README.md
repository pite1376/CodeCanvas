# 🚀 多功能图表与AI助手平台

一个基于React+TypeScript+Tailwind CSS的现代化Web应用，集成HTML预览器、图表转换器和AI助手三大核心功能模块。

## ✨ 在线预览

🌐 **[点击访问在线Demo](https://yourusername.github.io/your-repo-name)**

> 注意：首次访问可能需要等待几秒钟加载

## 🎯 项目特色

- 🎨 **深蓝科技风格设计** - 神经网络动画背景，科技感十足
- 📱 **完全响应式** - 支持桌面、平板、手机全设备适配
- 🌓 **智能主题切换** - 深色/浅色主题无缝切换
- ⚡ **实时预览渲染** - 代码即时生效，所见即所得
- 🔧 **模块化架构** - 组件化设计，易于维护和扩展

## 🛠️ 核心功能

### 1. 📝 HTML实时预览器
- 🎯 Monaco编辑器，支持语法高亮和智能提示
- 🖥️ 多设备响应式预览（桌面/平板/手机）
- 📸 **4K超高清截图** - 支持3840×2160分辨率导出
- 🎨 实时HTML/CSS/JS渲染
- 📱 视口尺寸动态切换

### 2. 📊 图表代码转换器
- 📈 **多图表库支持**：ECharts、Chart.js、Mermaid
- 🖼️ **超高清图片导出** - 最高8倍分辨率
- 🎨 自定义背景色和透明度
- 📏 可调节图表尺寸和预览缩放
- 🔄 实时代码预览和错误提示

### 3. 🤖 AI智能助手
- 💬 ChatGPT风格聊天界面
- 🔑 **DeepSeek V3 API集成** - 专业代码助手
- ⚡ 智能代码优化和错误诊断
- 📋 丰富的快捷功能模板
- 💾 API密钥本地安全存储

## 🚀 快速开始

### 在线使用
直接访问：**[https://yourusername.github.io/your-repo-name](https://yourusername.github.io/your-repo-name)**

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# 2. 安装依赖
npm install
# 或者使用 yarn/pnpm
yarn install
pnpm install

# 3. 启动开发服务器
npm start
# 应用将在 http://localhost:3000 启动

# 4. 构建生产版本
npm run build
```

## 📁 项目结构

```
src/
├── components/              # 组件目录
│   ├── HTMLPreviewer.tsx    # HTML预览器
│   ├── ChartConverter.tsx   # 图表转换器  
│   ├── AIAssistant.tsx      # AI助手
│   ├── NeuralNetworkBackground.tsx  # 神经网络背景
│   ├── DeepSeekConfig.tsx   # DeepSeek配置
│   └── ui/                  # UI基础组件
├── App.tsx                  # 主应用组件
├── App.css                  # 全局样式和动画
└── index.tsx               # 应用入口

public/                     # 静态资源
├── index.html             # HTML模板
├── manifest.json          # PWA配置
└── robots.txt            # SEO配置
```

## 🔧 技术栈

| 技术 | 版本 | 描述 |
|------|------|------|
| React | 18.2.0 | 用户界面库 |
| TypeScript | 4.9.5 | 类型安全 |
| Tailwind CSS | 3.3.0 | 样式框架 |
| Monaco Editor | 4.7.0 | 代码编辑器 |
| ECharts | 5.6.0 | 图表库 |
| Chart.js | 4.4.9 | 图表库 |
| Mermaid | 10.9.1 | 流程图库 |
| html-to-image | 1.11.13 | 截图导出 |
| Lucide React | 0.263.1 | 图标库 |

## 🎨 设计系统

### 🎯 配色方案
- **主色调**：深海蓝 `#00008B` → 天空蓝 `#1E90FF`
- **辅助色**：霓虹紫 `#9370DB`、银白色 `#F8F8FF`
- **功能色**：成功 `#10B981`、警告 `#F59E0B`、错误 `#EF4444`

### 📱 响应式断点
- **桌面**：≥1280px
- **平板**：768px-1279px  
- **手机**：≤767px

## 📦 部署方案

### 🚀 GitHub Pages（推荐）

1. **Fork本项目**到你的GitHub账户

2. **修改配置**：
   ```json
   // package.json
   "homepage": "https://your-username.github.io/your-repo-name"
   ```

3. **启用GitHub Pages**：
   - 进入仓库Settings → Pages
   - Source选择"GitHub Actions"

4. **自动部署**：
   - 推送代码到main分支
   - GitHub Actions自动构建和部署

### 🌐 其他部署平台

| 平台 | 命令 | 文档 |
|------|------|------|
| Vercel | `npx vercel` | [文档](https://vercel.com/docs) |
| Netlify | `npm run build` | [文档](https://docs.netlify.com) |
| Heroku | `git push heroku main` | [文档](https://devcenter.heroku.com) |

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源

## 🙏 致谢

- React团队提供优秀的框架
- Tailwind CSS提供灵活的样式方案
- Monaco Editor提供专业的代码编辑体验
- 各种开源图表库的贡献者们

---

⭐ **如果这个项目对你有帮助，请给个Star支持！**
