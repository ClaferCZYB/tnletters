# 高一新生致天南地北大学生的43封信

潼南中学高一（13）班 · 班主任发起 —— 一个用于展示与引导青年大学生查阅、回答高一新生来信的静态网站。

## 特性

- **青葱绿主题**：以清新葱绿为主色，配暖色信纸，兼顾温度与呼吸感。
- **两种展示模式**：随机抽取 5 封 / 查看全部 43 封。
- **信纸模拟**：每封信以「文字 + 模拟信纸」呈现，点击可拆开阅读。
- **实拍 + 二维码**：每封信内保留学生手写原稿照片，并附答题二维码，扫码即可跳转回答。
- **响应式**：同时适配电脑浏览器与手机浏览。

## 目录结构

```
tongnan-letters/
├── index.html          # 唯一页面
├── css/style.css       # 样式
├── js/data.js          # 43 封信数据（自动生成）
├── js/app.js           # 交互逻辑
├── assets/
│   ├── photos/         # 1.jpg ~ 43.jpg 学生手写实拍
│   └── qrcodes/        # 1.png ~ 43.png 答题二维码
└── README.md
```

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库（如 `tongnan-letters`），把 `tongnan-letters/` 目录内的内容推送到仓库根目录：

   ```bash
   cd tongnan-letters
   git init
   git add .
   git commit -m "init: 高一新生致天南地北大学生的43封信"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/tongnan-letters.git
   git push -u origin main
   ```

2. 在仓库 **Settings → Pages** 中，将 **Source** 设为 `Deploy from a branch`，分支选 `main`、目录选 `/ (root)`，保存。

3. 稍等片刻，即可通过 `https://<你的用户名>.github.io/tongnan-letters/` 访问。

> 纯静态站点，无需构建、无第三方依赖，直接部署即可。

## 内容更新

若信件数据需要更新，可修改 `js/data.js`（`LETTERS` 数组），并同步替换 `assets/photos/` 与 `assets/qrcodes/` 下对应编号的图片。
