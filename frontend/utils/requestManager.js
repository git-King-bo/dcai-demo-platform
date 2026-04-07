// utils/requestManager.js
/**
 * 请求管理器
 * 功能：
 * 1. 全局请求管理
 * 2. 跳转页面取消所有请求
 * 3. 点击按钮取消指定请求
 */
class RequestManager {
  constructor() {
    // 存储所有请求的取消令牌 { requestId: cancelToken }
    this.requests = new Map();
    
    // 存储分组请求 { groupId: Set<requestId> }
    this.requestGroups = new Map();
    
    // 默认请求分组（用于页面跳转时取消）
    this.DEFAULT_GROUP = 'global';
  }

  /**
   * 生成请求ID
   * @param {string} url - 请求地址
   * @param {object} config - 请求配置
   * @returns {string} 请求ID
   */
  generateRequestId(url, config = {}) {
    const { method = 'GET', params = {}, data = {} } = config;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    // 基于URL、方法、参数生成唯一ID
    const paramsStr = JSON.stringify(params);
    const dataStr = JSON.stringify(data);
    const hash = `${url}_${method}_${timestamp}_${random}`;
    
    return hash.substr(0, 32); // 限制长度
  }

  /**
   * 添加请求到管理器
   * @param {string} requestId - 请求ID
   * @param {Function} cancelToken - 取消函数
   * @param {string} groupId - 分组ID
   */
  addRequest(requestId, cancelToken, groupId = this.DEFAULT_GROUP) {
    this.requests.set(requestId, cancelToken);
    
    // 添加到分组
    if (!this.requestGroups.has(groupId)) {
      this.requestGroups.set(groupId, new Set());
    }
    this.requestGroups.get(groupId).add(requestId);
    
    return requestId;
  }

  /**
   * 移除请求
   * @param {string} requestId - 请求ID
   */
  removeRequest(requestId) {
    if (this.requests.has(requestId)) {
      this.requests.delete(requestId);
      
      // 从所有分组中移除
      this.requestGroups.forEach((requestSet, groupId) => {
        if (requestSet.has(requestId)) {
          requestSet.delete(requestId);
          
          // 如果分组为空，删除分组
          if (requestSet.size === 0) {
            this.requestGroups.delete(groupId);
          }
        }
      });
    }
  }

  /**
   * 取消指定请求
   * @param {string} requestId - 请求ID
   * @param {string} reason - 取消原因
   */
  cancelRequest(requestId, reason = '手动取消请求') {
    if (this.requests.has(requestId)) {
      const cancelToken = this.requests.get(requestId);
      cancelToken(reason);
      this.removeRequest(requestId);
      console.log(`请求已取消: ${requestId}`, reason);
      return true;
    }
    return false;
  }

  /**
   * 取消指定分组的所有请求
   * @param {string} groupId - 分组ID
   * @param {string} reason - 取消原因
   */
  cancelGroupRequests(groupId = this.DEFAULT_GROUP, reason = '取消分组请求') {
    if (this.requestGroups.has(groupId)) {
      const requestSet = this.requestGroups.get(groupId);
      const requestsToCancel = Array.from(requestSet);
      
      requestsToCancel.forEach(requestId => {
        this.cancelRequest(requestId, reason);
      });
      
      console.log(`分组 ${groupId} 的所有请求已取消`);
      return requestsToCancel.length;
    }
    return 0;
  }

  /**
   * 取消所有请求
   * @param {string} reason - 取消原因
   */
  cancelAllRequests(reason = '取消所有请求') {
    const requestIds = Array.from(this.requests.keys());
    
    requestIds.forEach(requestId => {
      this.cancelRequest(requestId, reason);
    });
    
    console.log('所有请求已取消');
    return requestIds.length;
  }

  /**
   * 获取所有请求数量
   */
  getRequestCount() {
    return this.requests.size;
  }

  /**
   * 获取分组请求数量
   * @param {string} groupId - 分组ID
   */
  getGroupRequestCount(groupId) {
    if (this.requestGroups.has(groupId)) {
      return this.requestGroups.get(groupId).size;
    }
    return 0;
  }

  /**
   * 清空管理器
   */
  clear() {
    this.requests.clear();
    this.requestGroups.clear();
  }
}

// 创建单例实例
const requestManager = new RequestManager();

export default requestManager;