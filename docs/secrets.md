# 部署 Secrets 配置

## GitHub 仓库

| 仓库 | 说明 |
|------|------|
| `ihavenoidea` | 写作源（建议私有） |
| `joyanne-web` | 站点（可公开） |

## Repository Variables

在两个仓库的 Settings → Secrets and variables → Actions → Variables：

| Variable | 仓库 | 示例值 |
|----------|------|--------|
| `JOYANNE_WEB_REPO` | ihavenoidea | `caspertu/joyanne-web` |
| `IHAVENOIDEA_REPO` | joyanne-web | `caspertu/ihavenoidea` |

## Secrets

### ihavenoidea

| Secret | 权限 | 用途 |
|--------|------|------|
| `JOYANNE_DISPATCH_TOKEN` | PAT `repo` scope | 推送章节后触发 joyanne-web 部署 |

### joyanne-web

| Secret | 权限 | 用途 |
|--------|------|------|
| `CLOUDFLARE_API_TOKEN` | `Cloudflare Pages:Edit` | 部署到 Pages |
| `CLOUDFLARE_ACCOUNT_ID` | — | Cloudflare 账号 ID |
| `IHAVENOIDEA_PAT` | 只读 `repo` | CI 拉取 `chapters/`（可选；无则用仓库内已同步章节） |

## Cloudflare Pages

1. Dashboard → Workers & Pages → Create → Pages → Connect to Git → 选 `joyanne-web`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Custom domain: `joyanne.online`
5. SSL: Full (Strict)，Always Use HTTPS: On

## 本地首次推送

```bash
# joyanne-web
cd /Users/xing/dev/joyanne-web
git commit -m "feat: MVP reading site with 10 chapters"
git remote add origin git@github.com:caspertu/joyanne-web.git
git push -u origin main

# ihavenoidea（含 notify workflow）
cd /Users/xing/dev/ihavenoidea
git remote add origin git@github.com:caspertu/ihavenoidea.git
git add .github/workflows/notify-joyanne-web.yml
git commit -m "ci: notify joyanne-web on chapter updates"
git push -u origin main
```