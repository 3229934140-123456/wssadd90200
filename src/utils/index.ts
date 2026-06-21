import Taro from '@tarojs/taro';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}年${m}月${d}日`;
};

export const getDaysAfter = (surgeryDate: string): number => {
  const start = new Date(surgeryDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

export const getTodayStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getNowTimeStr = (): string => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export const speakText = (text: string): void => {
  try {
    console.log('[语音播报]', text);
    Taro.showToast({
      title: '语音播报中',
      icon: 'none',
      duration: 1500
    });
  } catch (error) {
    console.error('[语音播报失败]', error);
    Taro.showToast({
      title: '播报失败，请重试',
      icon: 'none'
    });
  }
};

export const makePhoneCall = (phone: string): void => {
  try {
    Taro.makePhoneCall({
      phoneNumber: phone,
      success: () => {
        console.log('[拨号成功]', phone);
      },
      fail: (err) => {
        console.error('[拨号失败]', err);
        Taro.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  } catch (error) {
    console.error('[拨号异常]', error);
  }
};

export const showConfirm = (title: string, content: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Taro.showModal({
      title,
      content,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
};

export const getStatusText = (status: 'allow' | 'caution' | 'forbid' | 'consult'): string => {
  const map = {
    allow: '可以吃',
    caution: '暂缓食用',
    forbid: '不能吃',
    consult: '咨询医生'
  };
  return map[status];
};

export const getStatusColor = (status: 'allow' | 'caution' | 'forbid' | 'consult'): string => {
  const map = {
    allow: '#00B42A',
    caution: '#FF7D00',
    forbid: '#F53F3F',
    consult: '#165DFF'
  };
  return map[status];
};
