/**
 * 用於淨化用戶輸入以防止XSS攻擊的工具函數
 */

/**
 * 淨化輸入字符串，去除潛在的XSS攻擊代碼
 * @param {string} input - 用戶輸入的字符串
 * @return {string} - 淨化後的字符串
 */
exports.sanitizeInput = (input) => {
    if (!input) return '';
    
    // 轉換HTML特殊字符
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  /**
   * 驗證用戶名格式
   * @param {string} username - 用戶輸入的用戶名
   * @return {boolean} - 是否合法
   */
  exports.validateUsername = (username) => {
    // 用戶名只能包含字母、數字、下劃線，長度3-20
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };
  
  /**
   * 驗證電子郵件格式
   * @param {string} email - 用戶輸入的郵箱
   * @return {boolean} - 是否合法
   */
  exports.validateEmail = (email) => {
    // 簡單的郵箱格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * 驗證密碼強度
   * @param {string} password - 用戶輸入的密碼
   * @return {boolean} - 是否合法
   */
  exports.validatePassword = (password) => {
    // 密碼至少8位，包含數字和字母
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * 驗證展示名稱格式
   * @param {string} displayName - 用戶輸入的展示名稱
   * @return {boolean} - 是否合法
   */
  exports.validateDisplayName = (displayName) => {
    // 名稱2-50字符，允許字母、數字、空格和基本標點
    const displayNameRegex = /^[A-Za-z0-9\s\-_\.,]{2,50}$/;
    return displayNameRegex.test(displayName);
  };
  
  /**
   * 驗證Bio格式
   * @param {string} bio - 用戶輸入的Bio
   * @return {boolean} - 是否合法
   */
  exports.validateBio = (bio) => {
    // Bio最大長度500字符
    return bio.length <= 500;
  };