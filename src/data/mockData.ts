import type {
  FoodItem,
  WarnItem,
  RecommendItem,
  FollowUpInfo,
  CareTask,
  AbnormalItem,
  RecordItem,
  UserInfo,
  AbnormalReport
} from '@/types';

export const userInfo: UserInfo = {
  name: '张阿姨',
  age: 58,
  phone: '138****5678',
  projectName: '双眼皮手术',
  surgeryDate: '2026-06-18',
  nurseName: '李护士',
  nursePhone: '400-123-4567',
  storeName: '美丽人生医美中心（朝阳店）',
  familyName: '王女士（女儿）',
  familyPhone: '139****8765'
};

export const todayForbidList: WarnItem[] = [
  {
    id: '1',
    type: 'forbid',
    title: '🚫 绝对不能吃',
    foods: ['辣椒', '花椒', '生姜', '大蒜', '芥末', '咖喱'],
    reason: '辛辣食物会让伤口发红肿胀，恢复变慢，还可能留疤'
  },
  {
    id: '2',
    type: 'forbid',
    title: '🍺 绝对不能喝',
    foods: ['白酒', '啤酒', '红酒', '黄酒', '含酒精饮料'],
    reason: '酒精会扩张血管，引起出血和肿胀，加重疼痛'
  },
  {
    id: '3',
    type: 'forbid',
    title: '🦐 海鲜发物忌口',
    foods: ['虾', '蟹', '贝类', '海鱼', '海带', '紫菜'],
    reason: '海鲜容易引起过敏反应，影响伤口愈合'
  }
];

export const todayCautionList: WarnItem[] = [
  {
    id: '4',
    type: 'caution',
    title: '⚠️ 暂时少吃',
    foods: ['牛羊肉', '韭菜', '香菜', '竹笋', '蘑菇'],
    reason: '这些是"发物"，敏感体质可能引起红肿'
  }
];

export const todayRecommendList: RecommendItem[] = [
  { id: '1', name: '鸡蛋', benefit: '补充蛋白质，促进伤口愈合', icon: '🥚' },
  { id: '2', name: '牛奶', benefit: '补充钙质和蛋白质', icon: '🥛' },
  { id: '3', name: '瘦肉', benefit: '补充蛋白质和铁', icon: '🥩' },
  { id: '4', name: '新鲜蔬菜', benefit: '补充维生素，帮助消肿', icon: '🥬' },
  { id: '5', name: '水果', benefit: '维生素C促进愈合', icon: '🍎' },
  { id: '6', name: '冬瓜汤', benefit: '利水消肿，清淡好消化', icon: '🍲' }
];

export const followUpInfo: FollowUpInfo = {
  hasAppointment: true,
  date: '2026-06-25',
  time: '上午 10:00',
  note: '请提前10分钟到院，携带就诊卡',
  projectName: '双眼皮手术',
  daysAfter: 5
};

export const defaultCareTasks: CareTask[] = [
  {
    id: '1',
    title: '已准备清淡餐',
    description: '为顾客准备少油少盐的清淡饭菜',
    checked: false
  },
  {
    id: '2',
    title: '已提醒服药',
    description: '按照医嘱提醒顾客按时吃药',
    checked: false
  },
  {
    id: '3',
    title: '已观察伤口',
    description: '检查术区是否有红肿、渗液',
    checked: false
  },
  {
    id: '4',
    title: '已帮助冷敷',
    description: '术后72小时内，每次冷敷15-20分钟',
    checked: false
  }
];

export const abnormalList: AbnormalItem[] = [
  {
    id: '1',
    type: 'fever',
    title: '🤒 发热',
    description: '体温超过38度，或感觉浑身发冷',
    firstAction: '先测量体温，多喝水，用温水擦身降温',
    contactTime: '2小时内联系门店',
    urgent: true
  },
  {
    id: '2',
    type: 'redness',
    title: '🔴 明显红肿',
    description: '手术部位越来越红、肿、热、痛',
    firstAction: '先冷敷，不要用手摸，不要涂药膏',
    contactTime: '4小时内联系门店',
    urgent: false
  },
  {
    id: '3',
    type: 'bleeding',
    title: '💧 出血',
    description: '伤口渗血不止，或有血块',
    firstAction: '用干净纱布轻压止血，头稍抬高',
    contactTime: '1小时内联系门店',
    urgent: true
  },
  {
    id: '4',
    type: 'allergy',
    title: '😷 过敏反应',
    description: '全身起疹子、发痒，或呼吸困难',
    firstAction: '停止吃药，不要抓挠，保持皮肤清洁',
    contactTime: '2小时内联系门店',
    urgent: true
  },
  {
    id: '5',
    type: 'pain',
    title: '😣 剧烈疼痛',
    description: '止痛药也压不住的剧烈疼痛',
    firstAction: '先吃止痛药，安静休息，不要活动',
    contactTime: '4小时内联系门店',
    urgent: false
  },
  {
    id: '6',
    type: 'other',
    title: '❓ 其他不适',
    description: '其他感觉不对劲的情况',
    firstAction: '先休息观察，不要自己处理',
    contactTime: '当天联系门店',
    urgent: false
  }
];

export const foodDatabase: FoodItem[] = [
  { id: '1', name: '辣椒', status: 'forbid', reason: '辛辣刺激会引起伤口红肿', suggestion: '术后1个月内避免食用', category: '辛辣' },
  { id: '2', name: '麻辣火锅', status: 'forbid', reason: '辛辣+高温刺激，严重影响恢复', suggestion: '术后1个月内绝对不能吃', category: '辛辣' },
  { id: '3', name: '白酒', status: 'forbid', reason: '酒精扩张血管，可能出血肿胀', suggestion: '术后2周内严禁喝酒', category: '酒精' },
  { id: '4', name: '啤酒', status: 'forbid', reason: '含酒精，影响伤口愈合', suggestion: '术后2周内严禁喝', category: '酒精' },
  { id: '5', name: '虾', status: 'forbid', reason: '海鲜容易引起过敏', suggestion: '术后2周内避免食用', category: '海鲜' },
  { id: '6', name: '大闸蟹', status: 'forbid', reason: '寒性发物，可能引起过敏红肿', suggestion: '术后2周内避免食用', category: '海鲜' },
  { id: '7', name: '羊肉', status: 'caution', reason: '温补发物，敏感体质可能不适', suggestion: '术后1周后可少量食用，观察反应', category: '肉类' },
  { id: '8', name: '牛肉', status: 'caution', reason: '发温之物，部分人吃后红肿', suggestion: '术后1周后可少量食用', category: '肉类' },
  { id: '9', name: '韭菜', status: 'caution', reason: '属于发物，建议少吃', suggestion: '术后1周后可少量吃', category: '蔬菜' },
  { id: '10', name: '鸡蛋', status: 'allow', reason: '优质蛋白质，促进愈合', suggestion: '每天1-2个，蒸煮最好', category: '蛋奶' },
  { id: '11', name: '牛奶', status: 'allow', reason: '补充钙和蛋白质', suggestion: '每天一杯，温热饮用', category: '蛋奶' },
  { id: '12', name: '鸡胸肉', status: 'allow', reason: '优质蛋白，低脂肪', suggestion: '推荐食用，清蒸炖汤最佳', category: '肉类' },
  { id: '13', name: '菠菜', status: 'allow', reason: '含铁和维生素，帮助恢复', suggestion: '推荐食用，焯水后炒或煮汤', category: '蔬菜' },
  { id: '14', name: '苹果', status: 'allow', reason: '维生素C促进伤口愈合', suggestion: '每天一个，常温食用', category: '水果' },
  { id: '15', name: '西兰花', status: 'allow', reason: '维生素丰富，抗氧化', suggestion: '推荐食用，焯水后清炒', category: '蔬菜' },
  { id: '16', name: '人参', status: 'consult', reason: '大补药材，需根据体质判断', suggestion: '咨询医生后再决定是否食用', category: '补品' },
  { id: '17', name: '阿胶', status: 'consult', reason: '补血药材，可能与药物冲突', suggestion: '咨询医生后再食用', category: '补品' },
  { id: '18', name: '深海鱼油', status: 'consult', reason: '可能增加出血风险', suggestion: '咨询医生后再服用', category: '保健品' }
];

export const historyRecords: RecordItem[] = [
  {
    id: '1',
    projectName: '双眼皮手术',
    surgeryDate: '2026-06-18',
    doctorName: '王医生',
    nextFollowUp: '2026-06-25',
    notes: '术后注意休息，不要低头看书看手机，枕头垫高。7天拆线，拆线前不要沾水。',
    forbidFoods: ['辛辣', '酒精', '海鲜', '牛羊肉'],
    recommendFoods: ['鸡蛋', '牛奶', '瘦肉', '蔬菜', '水果']
  },
  {
    id: '2',
    projectName: '面部除皱',
    surgeryDate: '2025-11-10',
    doctorName: '李医生',
    nextFollowUp: '2025-11-17',
    notes: '面部表情不要太大，避免大笑。保持伤口干燥清洁。',
    forbidFoods: ['辛辣', '酒精', '海鲜'],
    recommendFoods: ['高蛋白食物', '新鲜蔬果', '胶原蛋白']
  }
];

export const abnormalReports: AbnormalReport[] = [
  {
    id: '1',
    type: 'redness',
    typeName: '明显红肿',
    reportTime: '2026-06-20 14:30',
    note: '右眼有点肿',
    status: 'resolved'
  }
];

export const mealVoiceReminders = {
  breakfast: '早上好，吃早饭前提醒您：早饭要吃得清淡有营养，可以吃鸡蛋、喝牛奶、喝粥。千万不要吃辣椒、不要喝酒、不要吃海鲜，这些东西会让伤口发炎红肿，恢复得慢。',
  lunch: '中午好，吃午饭前提醒您：午饭可以多吃蔬菜和瘦肉，补充营养帮助伤口长好。切记不要吃辣的、不要喝酒、不要吃虾蟹这些海鲜，吃了会让伤口发红发痒，一定要忍住哦！',
  dinner: '晚上好，吃晚饭前提醒您：晚饭不要吃得太饱太油，多吃清淡的蔬菜汤。绝对不能吃辣椒、生姜、大蒜这些辛辣的东西，也不能喝酒、吃海鲜，不然明天眼睛肿得更厉害了。'
};
