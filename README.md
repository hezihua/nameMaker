# 生辰起名（nameMaker）

根据公历出生时间排八字，结合《简易起名字典》（好名李）的五行组合与预设名字推荐中文名。

## 功能

- 四柱八字、纳音、五行分布、喜用神（扶抑法简化）
- 字典 **1430+** 字：五行、笔画、预设二字组合（从 PDF 提取）
- 取名规则：同类/相生补喜用，忌相克与泄耗喜用
- 音律检测（声调、连上声、声母韵母）
- 笔画统计，优先简洁

## 运行

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 部署到 Vercel

仓库根目录已包含 `vercel.json`（Next.js 构建、香港区域 `hkg1`、静态资源缓存与安全头）。

```bash
npx vercel          # 预览
npx vercel --prod   # 生产
```

或在 [Vercel Dashboard](https://vercel.com/new) 导入 Git 仓库，无需配置环境变量。

## 更新字库

修改 `scripts/extract-dictionary.py` 中的 PDF 路径（默认指向微信文件目录），然后：

```bash
pnpm extract-dict
```

## 技术栈

- Next.js · TypeScript · Tailwind
- `lunar-javascript` · `pinyin-pro`

## 说明

喜用神与排盘流派可能不同；结果供文化参考，正式取名请结合家庭意愿与户籍要求。
