# 岁照

岁照是一个极简个人成长记录应用：每岁一张，照见成长。MVP 使用 Next.js App Router、OpenNext Cloudflare Adapter、Cloudflare Workers、D1、R2、Better Auth、Drizzle、Zod 与 Vitest。

## 本地安装

```bash
pnpm install
```

创建本地密钥文件（不要提交）：

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
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
`dependencies` 中。Cloudflare Workers Builds 的构建命令应设置为
`pnpm cf:build`；不要在构建环境中使用 `pnpm install --prod` 后再手动删除这些依赖。
仓库暂未提交 lockfile，Cloudflare 可能先使用 npm 安装依赖；`.npmrc` 允许 npm
忽略 Better Auth 可选的 Lynx React peer dependency 冲突，避免依赖安装提前失败、
随后在 Next.js 阶段误报未安装 TypeScript。

## 图片隐私机制

图片不进入 `public` 目录，D1 只保存 R2 object key 和元数据，不保存二进制或永久公开 URL。R2 Bucket 保持私有；年龄照片通过 `/api/photos/[photoId]/file?variant=thumbnail|large` 读取，人物封面通过 `/api/persons/[personId]/cover` 读取。每次读取都验证真实 Session 和人物所有权，并返回 `Cache-Control: private` 与 `X-Content-Type-Options: nosniff`。

## 删除和补偿机制

D1 与 R2 没有跨服务事务。上传时先写新 R2 对象，再写 D1；D1 失败会删除新对象。替换时 D1 更新成功后再删除旧对象，旧对象删除失败只记录结构化日志，不回滚新照片。删除人物或照片时先删除 D1 记录，再补偿清理相关 R2 对象。

## 测试运行方式

```bash
pnpm typecheck
pnpm test
```

年龄计算测试覆盖生日当天、生日前一天、生日后一天、未满一岁、2月29日、跨年份与固定当前时间。数据库 Schema 保留 `year_photos_person_age_unique`，确保同一人物同一年龄只能保存一张照片。
