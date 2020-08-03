import AsyncStorage from "@react-native-community/async-storage";

export const storage = {
  async getItem(key: string) {
    const value = await AsyncStorage.getItem(key);
    return value;
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
