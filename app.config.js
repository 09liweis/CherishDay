import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      appwriteEndpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
      appwriteDatabaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      appwriteCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID,
      appwriteBucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
    },
  };
};