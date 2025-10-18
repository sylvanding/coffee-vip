# ☕ 咖啡店会员系统

一个现代化的咖啡店会员管理系统，支持用户注册、登录、会员卡展示和管理员功能。

---

## 🚨 重要提示

**如果遇到邀请码相关错误（"new row violates row-level security policy"），请立即查看：**

👉 **[如何修复邀请码问题.md](./如何修复邀请码问题.md)** - 3分钟快速修复指南

或直接执行修复脚本：
1. 打开 Supabase Dashboard → SQL Editor
2. 复制 `EXECUTE_THIS_SQL.sql` 的内容并运行
3. 完成！✅

---

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证系统**: Supabase Auth
- **图标库**: Lucide React
- **部署平台**: Netlify

## ✨ 功能特性

### 用户功能

- 📱 手机号注册/登录
- 🎫 邀请码注册系统
- 👤 个人资料管理
- 🏷️ 个性化用户名设置
- 💳 会员卡展示

### 管理员功能

- 👥 用户管理
- 🎟️ 邀请码生成和管理
- 📊 系统概览

### 安全特性

- 🔐 行级安全策略 (RLS)
- 🛡️ 用户权限控制
- 🔑 安全的认证流程

## 📋 部署要求

### 前置条件

- Node.js 18+
- npm 或 yarn
- Supabase 账户
- Netlify 账户

## 🛠️ 本地开发设置

### 1. 克隆项目

```bash
git clone https://github.com/sylvanding/coffee-vip
cd coffee-vip
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 Supabase

#### 3.1 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息并创建

#### 3.2 配置认证设置 ⚠️ 重要

**必须执行此步骤，否则登录会失败！**

1. 在 Supabase Dashboard 中，进入 **Authentication** → **Providers** → **Email**
2. 找到 **Confirm email** 选项并**关闭它**
3. 点击 **Save** 保存更改

> ⚠️ **为什么要关闭邮箱确认？**  
> 本系统使用虚拟邮箱地址（`${phone}@coffeeshop.local`）来实现手机号登录，因此不需要真实的邮箱确认。

#### 3.3 运行数据库迁移

1. 在 Supabase Dashboard 中，进入 "SQL Editor"
2. 复制 `supabase/migrations/20251018033523_create_coffee_shop_schema.sql` 中的内容
3. 粘贴并执行 SQL 脚本

#### 3.4 创建第一个管理员账户

在 SQL Editor 中执行以下命令创建邀请码：

```sql
INSERT INTO invitation_codes (code, created_by) 
VALUES ('ADMIN2024', null);
```

### 4. 配置环境变量

#### 4.1 创建本地环境文件

在项目根目录创建 `.env` 或 `.env.local` 文件：

```bash
cp env.example .env.local
```

#### 4.2 填写 Supabase 配置

在 `.env.local` 文件中填写你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **获取配置信息**: 在 Supabase Dashboard → Settings → API 中找到这些值

### 5. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 6. 创建管理员账户

1. 使用邀请码 `ADMIN2024` 注册第一个账户
2. 在 Supabase Dashboard 的 Table Editor 中找到 `user_profiles` 表
3. 将该用户的 `is_admin` 字段设置为 `true`

## 🌐 Netlify 部署指南

### 1. 准备部署

确保项目根目录有以下文件：

- `netlify.toml` (已包含)
- `package.json` (已包含)

### 2. 连接 GitHub 仓库

1. 将代码推送到 GitHub
2. 登录 [Netlify Dashboard](https://app.netlify.com)
3. 点击 "New site from Git"
4. 选择你的 GitHub 仓库

### 3. 配置构建设置

Netlify 会自动读取 `netlify.toml` 配置，包括：

- **构建命令**: `npm run build`
- **发布目录**: `dist`
- **Node.js 版本**: 18

### 4. 设置环境变量

在 Netlify Dashboard 中：

1. 进入 Site settings → Environment variables
2. 添加以下变量：

   ```
   VITE_SUPABASE_URL = https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

### 5. 部署

点击 "Deploy site"，Netlify 将自动构建和部署你的应用。

### 6. 自定义域名（可选）

在 Site settings → Domain management 中可以设置自定义域名。

## 🧪 本地测试指南

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npm run typecheck
```

### 测试完整流程

1. **注册测试**:
   - 使用测试手机号（如 `13800138000`）
   - 使用邀请码 `ADMIN2024`
   - 设置密码并注册

2. **登录测试**:
   - 使用注册的手机号和密码登录
   - 验证会员卡显示

3. **管理员功能测试**:
   - 将用户设置为管理员
   - 测试邀请码生成
   - 测试用户管理功能

## 📁 项目结构

```
coffee-vip/
├── src/
│   ├── components/          # React 组件
│   │   ├── AdminPanel.tsx   # 管理员面板
│   │   ├── LoginForm.tsx    # 登录表单
│   │   ├── MemberCard.tsx   # 会员卡
│   │   └── RegisterForm.tsx # 注册表单
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx  # 认证上下文
│   ├── lib/                 # 工具库
│   │   └── supabase.ts      # Supabase 客户端
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── supabase/
│   └── migrations/          # 数据库迁移文件
├── netlify.toml             # Netlify 配置
├── env.example              # 环境变量示例
└── README.md                # 项目文档
```

## 🔧 配置文件说明

### `netlify.toml`

- 构建配置
- 重定向规则（支持 SPA 路由）
- 安全头部设置
- 缓存优化

### `vite.config.ts`

- Vite 构建配置
- React 插件配置
- 依赖优化设置

### `tailwind.config.js`

- Tailwind CSS 配置
- 自定义主题设置

## 🗄️ 数据库架构

### `user_profiles` 表

- `id`: 用户 ID（关联 auth.users）
- `phone`: 手机号（唯一）
- `username`: 用户名
- `is_admin`: 是否为管理员
- `created_at`: 创建时间
- `updated_at`: 更新时间

### `invitation_codes` 表

- `id`: 邀请码 ID
- `code`: 邀请码内容
- `created_by`: 创建者 ID
- `used_by`: 使用者 ID
- `is_used`: 是否已使用
- `created_at`: 创建时间
- `used_at`: 使用时间

## 🔒 安全策略

项目实现了完整的行级安全策略（RLS）：

- **用户隔离**: 用户只能访问自己的数据
- **管理员权限**: 管理员可以管理所有用户和邀请码
- **邀请码验证**: 注册时验证邀请码的有效性
- **安全头部**: 通过 Netlify 配置添加安全头部

## 🚨 常见问题

### 1. 注册失败 - 邀请码无效 ⚠️ 重要

**错误信息**: `Invalid or already used invitation code`

**原因**: 数据库的 RLS 策略只允许已认证用户查询邀请码，但注册时用户处于匿名状态。

**解决方案**:
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 导航到 **SQL Editor**
4. 复制并执行 `supabase/migrations/20251018_fix_invitation_code_policy.sql` 中的内容
5. 刷新应用页面，重新尝试注册

> 💡 这个修复允许匿名用户在注册时验证邀请码！

### 2. 登录失败 - 400 Bad Request ⚠️ 重要

**错误信息**: `POST https://xxx.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)`

**原因**: Supabase 默认启用了邮箱确认，但系统使用虚拟邮箱地址。

**解决方案**:
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 导航到 **Authentication** → **Providers** → **Email**
4. **关闭** "Confirm email" 选项
5. 点击 **Save** 保存
6. 刷新应用页面，重新尝试登录

> 💡 这是系统能够正常工作的必要设置！

### 2. 环境变量未生效

- 确保 `.env` 或 `.env.local` 文件在项目根目录
- 变量名必须以 `VITE_` 开头
- 修改环境变量后需要重启开发服务器（`npm run dev`）
- 检查文件名是否正确（不是 `env.txt`）

### 3. Supabase 连接失败

- 检查 Supabase URL 和 API Key 是否正确复制
- 确保 Supabase 项目状态正常（在 Dashboard 中查看）
- 检查网络连接
- 验证 API Key 没有多余的空格或换行符

### 4. 数据库权限错误

- 确保已在 SQL Editor 中运行数据库迁移脚本
- 检查 RLS 策略是否正确设置
- 验证用户认证状态
- 确认邀请码存在且未被使用

### 5. 部署后页面空白

- 检查 Netlify 环境变量设置是否完整
- 查看浏览器控制台错误信息
- 确认构建过程无错误
- 检查 Supabase 认证设置（见问题 1）

## 📞 技术支持

如果遇到问题，请检查：

1. 浏览器控制台错误信息
2. Netlify 部署日志
3. Supabase 项目状态
4. 环境变量配置

## 📄 许可证

MIT License

---

**祝你使用愉快！** ☕✨
