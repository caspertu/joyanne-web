# joyanne-web

《七公主的发疯日常》在线阅读站 — Astro 5 纯静态站点，部署至 Cloudflare Pages。

## 本地开发

```bash
# 从 ihavenoidea 同步章节（默认 ../ihavenoidea）
npm run sync:chapters

# 开发服务器
npm run dev

# 构建（build 前自动 sync）
npm run build
npm run preview
```

## 目录

| 路径 | 说明 |
|------|------|
| `scripts/sync-chapters.mjs` | 解析 `ihavenoidea/chapters/*.md`，注入 frontmatter |
| `src/content/chapters/` | sync 输出（已提交，供无 PAT 时 CI 回退） |
| `content-meta/` | 站点配置、book.json stub |
| `.github/workflows/deploy.yml` | Cloudflare Pages 部署 |

## 部署前准备（PR0）

1. 将 `ihavenoidea` 与 `joyanne-web` 推送到 GitHub
2. 配置 Secrets：
   - `joyanne-web`: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `IHAVENOIDEA_PAT`
   - `ihavenoidea`: `JOYANNE_DISPATCH_TOKEN`
3. 设置 Repository Variables：`IHAVENOIDEA_REPO`, `JOYANNE_WEB_REPO`
4. Cloudflare Pages 绑定 `joyanne.online`