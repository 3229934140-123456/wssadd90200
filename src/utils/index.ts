import Taro from '@tarojs/taro';
import type { SurgeryPlan } from '@/types';

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

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getDateLabel = (dateStr: string): string => {
  const today = new Date();
  const target = new Date(dateStr);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (dateStr === todayStr) return '今天';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yStr) return '昨天';
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `${diff}天后`;
  if (diff < 0) return `${Math.abs(diff)}天前`;
  return '今天';
};

// ========== 三餐语音动态生成（联动术后计划） ==========
export interface BuildMealVoiceParams {
  meal: 'breakfast' | 'lunch' | 'dinner';
  projectName: string;
  daysAfter: number;
  surgeryPlan?: SurgeryPlan | null;
  forbiddenFoods?: string[];
  recommendedFoods?: string[];
}

const MEAL_META: Record<BuildMealVoiceParams['meal'], { greeting: string; mealName: string }> = {
  breakfast: { greeting: '早上好', mealName: '早饭' },
  lunch:   { greeting: '中午好', mealName: '午饭' },
  dinner:  { greeting: '晚上好', mealName: '晚饭' },
};

export const buildMealVoiceText = (params: BuildMealVoiceParams): string => {
  const { meal, projectName, daysAfter, surgeryPlan, forbiddenFoods = [], recommendedFoods = [] } = params;
  const meta = MEAL_META[meal];
  const parts: string[] = [];

  // 1. 问候 + 术后第几天
  parts.push(`${meta.greeting}！今天是您${projectName}术后第${daysAfter}天。`);
  parts.push(`吃${meta.mealName}前提醒您：`);

  // 2. 推荐饮食
  if (recommendedFoods.length > 0) {
    parts.push(`${meta.mealName}可以吃得清淡有营养，比如：${recommendedFoods.slice(0, 5).join('、')}。`);
  } else {
    parts.push(`${meta.mealName}要吃得清淡有营养，多吃蔬菜和优质蛋白。`);
  }

  // 3. 通用忌口（避免重复）
  const baseForbidden = ['辛辣', '酒精', '海鲜', '辣椒', '生姜', '大蒜'];
  const extraForbidden = forbiddenFoods.filter(
    (f) => !baseForbidden.some((b) => f.includes(b) || b.includes(f))
  );
  if (forbiddenFoods.length > 0) {
    parts.push(`千万不要吃${forbiddenFoods.slice(0, 6).join('、')}，这些东西会让伤口发炎红肿，恢复得慢。`);
  } else {
    parts.push(`切记不要吃辣的、不要喝酒、不要吃虾蟹这些海鲜，吃了会让伤口发红发痒，一定要忍住哦！`);
  }

  // 4. 特殊禁忌说明（护士写的）
  const specialTaboo = surgeryPlan?.tabooNotes || surgeryPlan?.forbiddenInstructions;
  if (specialTaboo && specialTaboo.trim()) {
    parts.push(`护士特别叮嘱：${specialTaboo.trim().replace(/[。.]+$/, '')}。`);
  }

  // 5. 用药提醒
  if (surgeryPlan?.medicationPlan && surgeryPlan.medicationPlan.trim()) {
    if (meal === 'breakfast') {
      parts.push(`别忘了吃药：${surgeryPlan.medicationPlan.trim().replace(/[。.]+$/, '')}。`);
    } else if (meal === 'dinner') {
      parts.push(`晚上记得按时服药：${surgeryPlan.medicationPlan.trim().replace(/[。.]+$/, '')}。`);
    }
  }

  // 6. 拆线/复诊临近提醒
  if (surgeryPlan?.stitchRemovalDate) {
    const diff = Math.round((new Date(surgeryPlan.stitchRemovalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= 2) {
      parts.push(`距离拆线还有${diff}天，请保持伤口干燥。`);
    }
  }

  parts.push('祝您早日恢复，越来越美！');
  return parts.join('');
};
