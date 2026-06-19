# joyanna.online — Handoff（2026-06-19）

## 项目概览

| 项 | 值 |
|----|-----|
| **站点** | https://www.joyanna.online（apex `joyanna.online` → 301 到 www） |
| **品牌** | Joy & Anna（域名 `joyanna.online`，两个 n） |
| **小说** | 《七公主的发疯日常》— 古装穿越爽文，幽默优先 |
| **读者** | 约 12 岁女儿（家庭 passion project） |
| **目标规模** | 100 章 / ~30 万字 |

## 双仓库架构

```
ihavenoidea/          写作源（私有）caspertu/ihavenoidea
    chapters/*.md  ──CI sync──►  joyanne-web/（公开）caspertu/joyanne-web
                                      └── Cloudflare Pages 部署
```

| 仓库 | GitHub | 用途 |
|------|--------|------|
| 写作 | `caspertu/ihavenoidea` | 章节 Markdown、story-bible、workflow |
| 站点 | `caspertu/joyanne-web` | Astro 5 静态站、sync 脚本、已同步章节 |

**本地路径：**

- 写作：`/Users/xing/dev/ihavenoidea/`
- 站点：`/Users/xing/dev/joyanne-web/`

## 当前发布状态

- **已上线章节：** 20 章（`chapter-01` … `chapter-20`）
- **最新站点提交：** `446bffc` feat: publish chapters 11-20
- **最新写作提交：** `0c81649` feat(chapters): publish chapters 11-20

### 第十一至二十章标题

| 章 | 标题 | 字数（约） | 备注 |
|----|------|-----------|------|
| 11 | 母后的茶盏，比毒还讲究 | 1671 | |
| 12 | 父皇的问话，比茶还烫 | 1706 | |
| 13 | 太子的门缝，他没有推 | 998 | 短篇体例，待扩写 |
| 14 | 五公主第一次没有告密 | 1234 | 短篇体例，待扩写 |
| 15 | 斗笠遮住脸，遮不住影子 | 1144 | 短篇体例，待扩写 |
| 16 | 七颗星唱过之后，兔子不见了 | 1122 | 短篇体例，待扩写 |
| 17 | 只看懂了一半 | 1119 | 短篇体例，待扩写 |
| 18 | 北边来的风，带着血 | 1127 | 短篇体例，待扩写 |
| 19 | 她能打开别人的梦，但没把人当锁 | 935 | 短篇体例，待扩写 |
| 20 | 有人撒谎，是为了让她多睡几年好觉 | 1401 | 短篇体例，待扩写 |

## 站点页面

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/read` | 章节目录 |
| `/read/chapter-NN` | 阅读器（localStorage 进度/字号） |
| `/book` | 书籍介绍 + 进度条 |
| `/characters` | 角色图鉴（深色主题，源自 Qoder `characters.html`） |
| `/about` | 关于（品牌 Joy & Anna） |
| `/downloads` | EPUB 下载（需 `全本.epub` 同步） |
| `/rss.xml` | RSS |

## 技术栈

- **Astro 5.14** + Tailwind 3，`output: 'static'`
- **托管：** Cloudflare Pages 项目 `joyanne-web`
- **CI：** GitHub Actions `deploy.yml`；ihavenoidea push `chapters/**` → `repository_dispatch`

### 常用命令（joyanne-web）

```bash
cd /Users/xing/dev/joyanne-web
npm run sync:chapters          # 从 ../ihavenoidea 同步
npm run sync:downloads         # 复制 全本.epub
npm run dev                    # 本地开发 :4321
npm run build                  # prebuild 自动 sync
```

### 同步脚本要点（`scripts/sync-chapters.mjs`）

- 解析 `## 第N章` H2，注入 frontmatter → `src/content/chapters/`
- 字数：ERROR < 900 阻断；< 1500 WARN（短篇章节）
- 连续性：已发布 `chapterNumber` 不允许缺口
- CI 环境变量：`IHAVENOIDEA_ROOT=/tmp/ihavenoidea`

## Secrets（已配置）

| Secret | 仓库 | 用途 |
|--------|------|------|
| `CLOUDFLARE_API_KEY` | joyanne-web | Global API Key 部署 |
| `CLOUDFLARE_EMAIL` | joyanne-web | `caspertu@gmail.com` |
| `IHAVENOIDEA_PAT` | joyanne-web | 拉取私有写作仓 |
| `JOYANNE_DISPATCH_TOKEN` | ihavenoidea | 触发站点部署 |

**安全提醒：** Global API Key 曾在对话中暴露，建议 Cloudflare 轮换后更新 GitHub Secret。

## 域名与 DNS（Cloudflare 账号 caspertu）

- Zone：`joyanna.online`（注意不是 joyanne.online）
- `www.joyanna.online` CNAME → `joyanne-web.pages.dev`
- apex → 301 重定向到 www（Dynamic Redirect ruleset）

## 写作仓库约束（AGENTS.md）

- **禁止**未经作者批准覆盖 `chapters/*.md`
- 幽默优先；目标章节 4500–7000 汉字（当前 11–20 章为短篇实验体例）
- 9 Stage 流水线（Stage 0–8），见 `workflow.md`
- **勿再跑** `make_docx.py`（已弃用）

## 待办 / 下一步

### 高优先级

1. **扩写第 13–19 章**至 2500+ 字（当前为刻意短篇，sync 会 WARN）
2. **更新 `全本.epub`**：本机 `novel-publisher` 导出后 push `ihavenoidea`，触发下载页更新
3. **轮换 Cloudflare API Key** 并更新 GitHub Secret

### 中优先级（设计文档 PR5–PR10）

- [ ] 楷体子集字体（Lighthouse ≥ 90）
- [ ] JSON-LD / 微信 OG 图（当前用 `cover.svg`）
- [ ] per-chapter PDF 从 `pdf-mobile/` 同步（v1.1）
- [ ] 角色图鉴：鬼影阵营归类待作者确认

### 低优先级

- [ ] `joyanne.online`（一个 n）域名是否另购/跳转
- [ ] ICP 备案评估
- [ ] 暗色阅读模式（v1.1）

## 新章发布流程

```bash
# 1. 写作仓完成 chapter-NN.md（含 ## 第N章 与 —— 第N章 完 ——）
cd /Users/xing/dev/ihavenoidea
git add chapters/chapter-NN.md chapters/README.md
git commit -m "feat(chapter-NN): ..."
git push    # → 自动 dispatch joyanne-web

# 2. 或本地验证后手动推站点
cd /Users/xing/dev/joyanne-web
npm run sync:chapters && npm run build
git add src/content/chapters/ && git commit -m "sync: chapter-NN" && git push
```

## 关键文件索引

| 文件 | 用途 |
|------|------|
| `ihavenoidea/chapters/chapter-*.md` | 章节真相源 |
| `ihavenoidea/小说·人设与大纲.md` | 人设 /book 文案来源 |
| `ihavenoidea/规划/joyanne.online-设计文档.md` | 完整设计 + PR Plan |
| `joyanne-web/scripts/sync-chapters.mjs` | 章节同步 |
| `joyanne-web/content-meta/site.json` | 站点元数据 |
| `joyanne-web/docs/secrets.md` | 部署 Secrets 说明 |
| `joyanne-web/src/pages/characters.astro` | 角色图鉴入口 |

## 联系人

- GitHub：`caspertu`（`caspertu@gmail.com`）
- Cloudflare + 域名：`joyanna.online` 在同一账号下