import { Account, Client, ID } from 'appwrite';

// 初始化 Appwrite 客户端
export const client = new Client();

// 配置 Appwrite 客户端
// 注意：在实际应用中，这些值应该从环境变量中获取
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // 设置 Appwrite 端点
  .setProject('68793df7003a41322941'); // 设置项目 ID，需要替换为实际的项目 ID

// 创建账户实例
export const account = new Account(client);

// 用户认证相关函数
export const appwriteAuth = {
  // 注册新用户
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await account.create(ID.unique(), email, password, name);
      if (response) {
        // 注册成功后自动登录
        return await appwriteAuth.login(email, password);
      }
      return response;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 用户登录
  login: async (email: string, password: string) => {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  // 用户登出
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  },
};