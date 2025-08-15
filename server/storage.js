export class MemStorage {
  constructor() {
    this.users = new Map();
    this.contractConfigs = new Map();
    this.compileResults = new Map();
    this.testResults = new Map();
    this.deployResults = new Map(); // userId_network
    this.currentId = 1;
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser) {
    const user = { ...insertUser, id: this.currentId++ };
    this.users.set(user.id, user);
    return user;
  }

  async saveContractConfig(userId, config) {
    this.contractConfigs.set(userId, config);
    return config;
  }

  async getContractConfig(userId) {
    return this.contractConfigs.get(userId);
  }

  async saveCompileResult(userId, result) {
    this.compileResults.set(userId, result);
    return result;
  }

  async getCompileResult(userId) {
    return this.compileResults.get(userId);
  }

  async saveTestResult(userId, result) {
    this.testResults.set(userId, result);
    return result;
  }

  async getTestResult(userId) {
    return this.testResults.get(userId);
  }

  async saveDeployResult(userId, network, result) {
    const key = `${userId}_${network}`;
    this.deployResults.set(key, result);
    return result;
  }

  async getDeployResult(userId, network) {
    const key = `${userId}_${network}`;
    return this.deployResults.get(key);
  }
}

export const storage = new MemStorage(); 