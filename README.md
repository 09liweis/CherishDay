# CherishDays

CherishDays 是一个简洁的日期提醒应用，帮助您跟踪和记住重要的日期，如生日、纪念日、账单日期和截止日期。

![CherishDays 应用截图](https://via.placeholder.com/800x400?text=CherishDays+App+Screenshot)

## 功能特点

- 📅 **多种日期类型**：支持一次性、每月重复和每年重复的日期
- 🔄 **智能排序**：根据下一次出现的日期自动排序
- 🎨 **状态可视化**：不同状态（今天、即将到来、已过期）的日期有不同的视觉样式
- 📱 **跨平台**：支持 iOS、Android 和 Web 平台
- 💾 **本地存储**：数据保存在设备本地，保护您的隐私

## 技术栈

- [React Native](https://reactnative.dev/) - 跨平台移动应用开发框架
- [Expo](https://expo.dev/) - React Native 开发工具和服务
- [Expo Router](https://docs.expo.dev/routing/introduction/) - 应用导航和路由
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - 数据持久化存储
- [React Context API](https://reactjs.org/docs/context.html) - 状态管理
- [Lucide Icons](https://lucide.dev/) - 图标库

## 安装和运行

### 前提条件

- [Node.js](https://nodejs.org/) (v14.0.0 或更高版本)
- [npm](https://www.npmjs.com/) (v6.0.0 或更高版本) 或 [Yarn](https://yarnpkg.com/) (v1.22.0 或更高版本)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (可选，用于更方便的开发体验)

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/CherishDays.git
cd CherishDays
```

2. 安装依赖

```bash
npm install
# 或者使用 Yarn
yarn install
```

3. 启动开发服务器

```bash
npx expo start
# 或者如果已安装 Expo CLI
expo start
```

4. 运行应用

- 使用 [Expo Go](https://expo.dev/client) 应用扫描终端中显示的二维码（iOS/Android）
- 按 `w` 在 Web 浏览器中打开
- 按 `a` 在 Android 模拟器中打开
- 按 `i` 在 iOS 模拟器中打开

## 项目结构

```
CherishDays/
├── app/                    # 应用路由和页面
│   ├── _layout.tsx         # 根布局
│   └── (tabs)/             # 标签页
│       ├── _layout.tsx     # 标签页布局
│       └── index.tsx       # 主页
├── components/             # UI 组件
│   ├── AddDateModal.tsx    # 添加日期模态框
│   ├── DateCard.tsx        # 日期卡片
│   ├── DateList.tsx        # 日期列表
│   ├── DatePicker.tsx      # 日期选择器
│   └── TypeSelector.tsx    # 类型选择器
├── contexts/               # React 上下文
│   └── DateContext.tsx     # 日期数据管理
├── assets/                 # 静态资源
└── ...                     # 其他配置文件
```

## 使用指南

### 添加新日期

1. 点击主页右下角的 "+" 按钮
2. 输入日期标题
3. 选择日期
4. 选择日期类型（一次性、每月或每年）
5. 点击 "添加" 按钮保存

### 删除日期

1. 在日期卡片上点击删除图标
2. 在确认对话框中点击 "删除" 确认

## 未来计划

- [ ] 多语言支持
- [ ] 编辑现有日期
- [ ] 日期提醒通知
- [ ] 深色模式和自定义主题
- [ ] 数据备份和恢复功能

## 贡献指南

欢迎贡献！如果您想为 CherishDays 做出贡献，请遵循以下步骤：

1. Fork 仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过 [issues](https://github.com/yourusername/CherishDays/issues) 页面联系我们。

---

使用 ❤️ 和 React Native 构建