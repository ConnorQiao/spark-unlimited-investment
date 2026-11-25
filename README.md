# Spark Unlimited Investment 官网

风险投资机构 Spark Unlimited Investment 的单页官网，中英双语。纯静态站点，没有构建步骤，也没有第三方脚本。

## 本地预览

```bash
python3 -m http.server 4173
```

然后打开 <http://localhost:4173>。

默认显示英文。语言按以下顺序决定：地址里的 `?lang=zh` 或 `?lang=en`，访客上次的选择，英文。

## 目录

```
index.html              页面结构（含英文默认文案，便于无脚本环境与搜索引擎读取）
assets/css/styles.css   全部样式，按板块分段
assets/js/config.js     站点配置：表单提交地址、联系邮箱
assets/js/i18n.js       中英文文案，页面文字以这里为准
assets/js/main.js       语言切换、入场动效、首屏射线、表单等交互
assets/img/             logo 与网站图标
```

## 设计

**原则**：浅色、单色，靠排版与留白说话。没有渐变、光晕、卡片和装饰图形。

| 项目 | 取值 |
| --- | --- |
| 底色 | 暖白 `#F4F3EF` |
| 文字 | 墨黑 `#0E0E0C`，次级 `#57564F`，辅助 `#8B8A83` |
| 强调色 | 橙 `#FF4D00`，只用在圆点上 |
| 深色区 | 联系我们与页脚，底色与文字互换 |
| 栅格 | 12 栏，左侧 3 栏放板块标签，正文从第 4 栏起 |

**Logo**：一个点，和从它出发的射线。点是星火，射线没有终点，对应 Spark 与 Unlimited。

**圆点的用法**：它出现在 logo、每个大标题的末尾（代替句号）、配比射线的起点，除此之外不再使用强调色。

**首屏**：标题末尾的圆点发出一条射线，延伸到画面之外，方向跟随指针；没有指针时停在右上方。

**投资方向**：每一行的射线长度就是它在组合里的占比（70 / 20 / 10）。

**动效**：标题逐行升起、细线从左划出、正文轻微上浮，再无其他。系统开启「减少动态效果」时全部关闭。

**手机上**（宽度 640 像素以内）：只留骨架，细节点开再看。

- 首屏说明换成短版（`hero.ledeShort`），各板块标题下的补充说明不显示。
- 介绍里的投资阶段等事实排成单行，不带备注。
- 信条、投资方向、团队简介默认收起，点那一行展开。
- 页脚不再重复导航链接。

`index.html` 里带 `hide-phone` 的元素手机上不出现，带 `only-phone` 的只在手机上出现，包在 `.fold` 里的文字手机上默认收起。规则集中在 `assets/css/styles.css` 末尾的「手机」一段。

## 页面板块

| 锚点 | 内容 |
| --- | --- |
| `#top` | 首屏：标题与射线 |
| `#about` | 介绍：机构定位与投资方式 |
| `#mission` | 使命愿景与信条 |
| `#focus` | 投资方向：配比与各方向的关注领域，点击行可展开或收起 |
| `#team` | 管理团队 |
| `#contact` | 联系我们：留资表单 |

## 上线前需要替换的占位内容

- **管理团队**：姓名、职务、简介均为示意，在 `assets/js/i18n.js` 的 `team.members` 里改（中英文各一份）。
- **人物照片**：团队区默认是纯文字名单。需要照片时，把图片放进 `assets/img/team/`，在 `index.html` 对应的 `.roster__row` 上写 `data-photo="assets/img/team/xxx.jpg"`，指针悬停在这一行时照片会跟随出现。建议比例 4 : 5。
- **介绍里的投资阶段、角色、周期、决策方式**：按基金实际情况调整，位置在 `about.facts`。
- **联系邮箱**：`assets/js/config.js` 里的 `emails`，现在用的是 `.example` 保留域名。
- **留资表单**：见下一节，未配置前留言不会被发送。
- **页脚合规声明**：`footer.legal`，请法务确认措辞。

## 留资表单

`assets/js/config.js` 里的 `formEndpoint` 留空时，表单处于演示模式：校验、发送中、成功状态都会正常走完，但数据不会发出，成功提示下方会显示一行说明。

填入地址后，表单以 `POST` 提交 JSON：

```json
{
  "name": "", "company": "", "email": "", "phone": "",
  "role": "founder | creator | investor | other",
  "message": "", "lang": "zh | en", "page": "", "submittedAt": ""
}
```

接口返回 2xx 视为成功。可以对接自有后端、Formspree 这类表单服务，或飞书多维表格的自动化 Webhook。表单里带有蜜罐字段 `website`，被填写时判定为机器人，不会提交。

## 修改文案

所有文字都在 `assets/js/i18n.js`，`zh` 与 `en` 结构一致，改完刷新即可。

- 标题里的 `<br>` 控制换行。
- 大标题末尾不要写句号，页面会接上圆点。
- `hero.ledeShort` 是手机上显示的短版首屏说明，改 `hero.lede` 时一起看。
- `index.html` 里的英文是兜底内容，改英文文案时建议同步。

## 字体

全站使用**阿里妈妈方圆体**（可变字重，免费可商用），中文、英文、数字是同一套字形。标题用 300，正文用 400。

目前字体文件直接从 jsDelivr 加载，是完整的一个文件，约 2.9 MB。页面会等字体就绪再开场，最多等 1.6 秒；超时或加载失败时回落到系统黑体，页面照常可用。

正式上线前建议把字体放到自己的服务器，并按页面用到的字符裁剪子集（裁剪后通常在 100 KB 左右）。改动位置是 `assets/css/styles.css` 顶部的 `@font-face` 和 `index.html` 里的预加载地址。

## 品牌资产

| 文件 | 用途 |
| --- | --- |
| `assets/img/logo-mark.svg` | 图形标，用于浅色背景 |
| `assets/img/logo-mark-inverse.svg` | 图形标，用于深色背景 |
| `assets/img/logo-mark-mono.svg` | 单色版，改 `color` 属性即可换色 |
| `assets/img/favicon.svg` | 网站图标 |

字标为全称「Spark Unlimited Investment」，用方圆体 500 字重排成，固定排成两行（Spark Unlimited / Investment），与图形标并排使用。

## 可访问性

- 导航、展开行、表单都支持键盘操作，焦点有明显的描边。
- 没有 JavaScript 时页面内容仍然完整可读（显示英文）。
- 导航压在深色区域上时会自动切换配色。

## 部署

站点通过 GitHub Pages 发布，地址：<https://connorqiao.github.io/spark-unlimited-investment/>

推送到 `main` 分支后会自动重新发布，通常一两分钟生效。

**搜索引擎收录**：`index.html` 的 `<head>` 里目前有一行 `<meta name="robots" content="noindex, nofollow">`，搜索引擎不会收录这个页面。团队信息换成真实内容后，删掉这一行再推送即可。

**绑定自己的域名**：在仓库的 Settings → Pages → Custom domain 填入域名，再到域名服务商那里按提示添加 DNS 记录。

整个目录就是站点本身，也可以直接上传到其他静态托管（对象存储加 CDN、Nginx、Vercel、Netlify 等）。
