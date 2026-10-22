# Excel 转 JSON 智能工具

一个强大的 Excel 到 JSON 转换器，支持可视化字段映射、实时预览以及基于 Gemini AI 的智能数据结构生成。

## 环境要求

- Node.js (推荐 v20 或以上版本)

## 快速开始

1. **安装依赖**
   在项目根目录下，打开终端并运行：
   ```bash
   npm install
   ```

2. **配置环境变量**
   在项目根目录下创建一个名为 `.env` 的文件，并添加您的 Gemini API 密钥：
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(注意：如果您没有 Gemini API 密钥，需要前往 Google AI Studio 申请)*

3. **启动开发服务器**
   运行以下命令启动项目（默认端口 3000）：
   ```bash
   npm run dev
   ```

### 端口配置与随机端口

如果您的 3000 端口经常被占用，或者想指定其他端口，项目提供了多种灵活方式：

#### 方式一：每次启动自动分配随机空闲端口
操作系统会自动寻找一个当前完全空闲的随机端口启动，绝不冲突：
```bash
npm run dev:random
```
或者通过参数启动：
```bash
npm run dev -- --random-port
```

#### 方式二：命令行指定固定端口
通过 `--port` 参数指定任意你想要的端口（例如 8080）：
```bash
npm run dev -- --port 8080
```
*(如果是生产模式运行：`node dist/server.cjs --port 8080`)*

#### 方式三：使用环境变量 PORT
通过环境变量临时指定或在 `.env` 中配置：
- **Linux / macOS**:
  ```bash
  PORT=5000 npm run dev
  ```
- **Windows (PowerShell)**:
  ```powershell
  $env:PORT=5000; npm run dev
  ```
- **写入 `.env` 文件**:
  在根目录 `.env` 文件中加入：
  ```env
  PORT=5000
  ```

#### 💡 自动防冲突特性
如果您直接运行 `npm run dev`，如果 3000 端口被占用，服务**不会崩溃报错**，而是会自动顺延尝试 3001、3002... 直到找到可用端口并在控制台打印可访问的地址。

## 生产环境构建

如果您想要构建生产环境版本并运行：

```bash
# 1. 构建前端和后端资源
npm run build

# 2. 启动生产服务器（同样支持 --port 或 --random-port）
npm run start
```
