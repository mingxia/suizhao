# 照见

照见是一个极简个人成长记录应用：每岁一张，照见成长。MVP 使用 Next.js App Router、OpenNext Cloudflare Adapter、Cloudflare Workers、D1、R2、Better Auth、Drizzle、Zod 与 Vitest。

## 本地安装

```bash
pnpm install
```

创建本地密钥文件（不要提交）：

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

## Cloudflare 登录

```bash
pnpm wrangler login
```

## D1 创建

```bash
pnpm wrangler d1 create suizhao-db
```

将返回的 `database_id` 填入 `wrangler.jsonc`，绑定名保持 `DB`。

## R2 创建

```bash
pnpm wrangler r2 bucket create suizhao-photos
```

R2 Bucket 必须保持私有，绑定名保持 `PHOTOS`。

## Binding 配置与类型生成

`wrangler.jsonc` 声明 Worker、D1、R2、assets 与 `nodejs_compat`。每次修改后运行：

```bash
pnpm cf:typegen
```

生成的 Cloudflare 类型文件需要提交。

## Better Auth Secret 配置

生产环境使用 Cloudflare Secret：

```bash
pnpm wrangler secret put BETTER_AUTH_SECRET
```

`BETTER_AUTH_URL` 可放在 `wrangler.jsonc` 的 `vars` 中。

## Google 登录配置

在 Google Cloud Console 创建 **Web application** 类型的 OAuth 2.0 Client，并配置授权回调地址：

- 本地：`http://localhost:3000/api/auth/callback/google`
- 生产：`https://weseeva.com/api/auth/callback/google`

Client ID 和 Client Secret 不要提交到仓库。生产环境使用 Cloudflare Secret：

```bash
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
```

这两个命令不是把值写进 `wrangler.jsonc`。请在项目根目录依次运行命令；Wrangler
出现输入提示后，分别粘贴 Google Cloud Console 生成的 **Client ID** 和
**Client Secret** 并确认。Wrangler 会将它们直接加密保存到当前 `seeva` Worker 的
Cloudflare Secrets 中，命令和密钥的对应关系如下：

| Wrangler Secret 名称 | 提示出现后粘贴的 Google 值 |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client 的 Client ID |
| `GOOGLE_CLIENT_SECRET` | 同一个 OAuth 2.0 Client 的 Client Secret |

也可以在 Cloudflare Dashboard 的 **Workers & Pages → seeva → Settings → Variables and
Secrets** 中添加同名的两个 **Secret**。不要将它们添加为明文 Variable，也不要放进
`wrangler.jsonc` 的 `vars`；`wrangler.jsonc` 会被 Git 提交，适合存放公开的
`BETTER_AUTH_URL`，不适合存放 OAuth 凭据。设置 Secret 后重新部署 Worker。

如果曾经看到 `?error=state_mismatch`，请先部署包含 OAuth Cookie State 修复的最新版本，
然后清除 `weseeva.com` 和 `www.weseeva.com` 的旧 Cookie，再从登录页重新发起一次 Google
登录。生产配置会将短期 OAuth state 加密保存在 Cookie 中，并让该 Cookie 在 apex 与
`www` 域名之间共享；不要通过其他临时 Worker 域名发起登录。还应确认 Google Console
中的生产回调地址与上面的地址逐字一致，且 `BETTER_AUTH_SECRET` 是固定设置的 Secret，
没有在两次请求之间被修改。

## Schema 生成

认证表 Schema 应由 Better Auth CLI 生成并保存到 `src/db/schema/auth.ts`；业务表在 `src/db/schema/app.ts`。生成迁移：

```bash
pnpm db:generate
```

## Migration 应用

本地：

```bash
pnpm db:migrate:local
```

生产：

```bash
pnpm db:migrate:remote
```

不要在 Worker 请求中自动执行 migration。

## 本地开发

```bash
pnpm dev
```

涉及 Better Auth、D1、R2、图片上传、私有图片读取、Cloudflare bindings 或部署前验证时，必须使用 Workers runtime 预览。

## Workers preview

```bash
pnpm preview
```

## 生产部署

```bash
pnpm typecheck
pnpm test
pnpm cf:build
pnpm db:migrate:remote
pnpm deploy
```

部署后执行注册、登录、创建人物、上传照片、读取照片、替换照片、删除人物冒烟测试。

Cloudflare 的构建环境可能只安装生产依赖，因此 Next.js 构建阶段必需的
`typescript`、`@types/node`、`@types/react` 和 `@types/react-dom` 保留在
`dependencies` 中。Cloudflare Workers Builds 控制台里的 **Build command** 设置为 `pnpm build`（保留旧配置
`pnpm cf:build` 也可以），**Deploy command** 设置为 `pnpm exec opennextjs-cloudflare deploy`。
项目的 `build` 脚本会执行完整的 OpenNext 构建，并生成部署阶段所需的 `.open-next`
Worker、静态资源和 `.open-next/.build/open-next.config.edge.mjs` 编译配置；仅执行
`next build` 会导致部署时报 “Could not find compiled Open Next config”。OpenNext 构建器
通过 `open-next.config.ts` 中的 `buildCommand` 调用 `pnpm next:build` 来构建 Next.js，
从而避免递归启动 OpenNext。
不要在构建环境中使用 `pnpm install --prod` 后再手动删除这些依赖。
`pnpm-lock.yaml` 已提交，Cloudflare 应使用锁定版本安装依赖。TypeScript 固定在
Next.js 当前可加载的 5.9.x；不要改回 `latest`，因为 TypeScript 7 的 npm 包不再
提供 Next.js 构建检测所依赖的 CommonJS 入口，会被误报为“未安装 TypeScript”。
`.npmrc` 允许 npm 忽略 Better Auth 可选的 Lynx React peer dependency 冲突，避免依赖
安装提前失败。部署设置修改后请清除 Cloudflare 构建缓存再重新部署。

## 图片隐私机制

图片不进入 `public` 目录，D1 只保存 R2 object key 和元数据，不保存二进制或永久公开 URL。R2 Bucket 保持私有；年龄照片通过 `/api/photos/[photoId]/file?variant=thumbnail|large` 读取，人物封面通过 `/api/persons/[personId]/cover` 读取。每次读取都验证真实 Session 和人物所有权，并返回 `Cache-Control: private` 与 `X-Content-Type-Options: nosniff`。

首页使用的公开示例图不属于用户上传内容。请将六张首页素材放在项目根目录下的
`public/images/home/`（与 `app/` 同级），**不是** `app/(public)/`。依次命名为
`hero01.webp` 至 `hero06.webp`。这些文件在页面中的公开访问路径对应
`/images/home/hero01.webp` 至 `/images/home/hero06.webp`。

## 删除和补偿机制

D1 与 R2 没有跨服务事务。上传时先写新 R2 对象，再写 D1；D1 失败会删除新对象。替换时 D1 更新成功后再删除旧对象，旧对象删除失败只记录结构化日志，不回滚新照片。删除人物或照片时先删除 D1 记录，再补偿清理相关 R2 对象。

## 测试运行方式

```bash
pnpm typecheck
pnpm test
```

年龄计算测试覆盖生日当天、生日前一天、生日后一天、未满一岁、2月29日、跨年份与固定当前时间。数据库 Schema 保留 `year_photos_person_age_unique`，确保同一人物同一年龄只能保存一张照片。
## Stripe 支付配置

English-language lifetime membership purchases use Stripe Checkout. Configure these secrets in every deployed Cloudflare environment:

```sh
pnpm wrangler secret put STRIPE_SECRET_KEY
pnpm wrangler secret put STRIPE_WEBHOOK_SECRET
```

In Stripe, register `https://weseeva.com/api/stripe/webhook` as a webhook endpoint and subscribe it to `checkout.session.completed`. The lifetime product and its one-time USD 49.99 price are created inline when checkout begins. Chinese-language purchases continue to use the existing WeChat QR and manual approval flow.
