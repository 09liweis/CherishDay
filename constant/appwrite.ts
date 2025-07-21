import { Account, Client, ID, OAuthProvider } from 'react-native-appwrite';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

// 从环境变量中获取 Appwrite 配置
// 优先使用 process.env，如果不可用则尝试从 expo-constants 获取
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 
  Constants.expoConfig?.extra?.appwriteEndpoint

const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 
  Constants.expoConfig?.extra?.appwriteProjectId

// 初始化 Appwrite 客户端
export const client = new Client();

// 配置 Appwrite 客户端
client
  .setEndpoint(APPWRITE_ENDPOINT) // 设置 Appwrite 端点
  .setProject(APPWRITE_PROJECT_ID) // 设置项目 ID
  ; 

// 导出 Appwrite 配置，以便在其他地方使用
export const APPWRITE_CONFIG = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
};

// 创建账户实例
export const account = new Account(client);

// 获取当前应用的URL方案，用于OAuth重定向
const getRedirectURL = () => {
  // 在开发环境中，使用特定的重定向URL
  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'http://localhost'  // Android开发环境
      : 'http://localhost';  // iOS开发环境
  }
  
  // 在生产环境中，使用应用的URL方案
  const scheme = Constants.expoConfig?.scheme;
  if (!scheme) {
    throw new Error('应用URL方案未定义。请在app.json中添加scheme字段。');
  }
  
  return `${scheme}://`;
};

// 用户认证相关函数
export const appwriteAuth = {
  // 使用Google登录
  loginWithGoogle: async () => {
    try {
      // 创建深度链接，在所有Expo环境中都能工作
      // 确保使用localhost作为主机名，以避免成功/失败URL的验证错误
      const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
      const scheme = `${deepLink.protocol}//`; // 例如 'exp://' 或 'appwrite-callback-<PROJECT_ID>://'
      
      // 开始OAuth流程
      const loginUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        `${deepLink}`,
        `${deepLink}`
      );
      
      // 打开loginUrl并监听scheme重定向
      const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
      
      if (result.type === 'success') {
        // 从OAuth重定向URL中提取凭据
        const url = new URL(result.url);
        const secret = url.searchParams.get('secret');
        const userId = url.searchParams.get('userId');
        
        if (secret && userId) {
          // 使用OAuth凭据创建会话
          await account.createSession(userId, secret);
          
          // 获取当前用户信息
          return await appwriteAuth.getCurrentUser();
        } else {
          throw new Error('未能从重定向URL中获取凭据');
        }
      } else {
        throw new Error('用户取消了登录');
      }
    } catch (error) {
      console.error('Google登录失败:', error);
      throw error;
    }
  },
  
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