import type {
  FoodItem,
  WarnItem,
  RecommendItem,
  FollowUpInfo,
  CareTask,
  AbnormalItem,
  RecordItem,
  UserInfo,
  AbnormalReport,
  DailyCareEntry,
  SurgeryPlan,
  NurseFollowUpNote
} from '@/types';
import { getTodayStr } from '@/utils';

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

// 生成演示用的照护日历
const genDemoDailyCare = (): DailyCareEntry[] => {
  const tasks1: CareTask[] = [
    { id: '1', title: '已准备清淡餐', description: '', checked: true, checkedTime: '2026-06-20 07:45' },
    { id: '2', title: '已提醒服药', description: '', checked: true, checkedTime: '2026-06-20 08:10' },
    { id: '3', title: '已观察伤口', description: '', checked: true, checkedTime: '2026-06-20 09:30' },
    { id: '4', title: '已帮助冷敷', description: '', checked: false }
  ];
  const tasks2: CareTask[] = [
    { id: '1', title: '已准备清淡餐', description: '', checked: true, checkedTime: '2026-06-21 08:00' },
    { id: '2', title: '已提醒服药', description: '', checked: false },
    { id: '3', title: '已观察伤口', description: '', checked: true, checkedTime: '2026-06-21 09:00' },
    { id: '4', title: '已帮助冷敷', description: '', checked: true, checkedTime: '2026-06-21 10:15' }
  ];
  return [
    { date: '2026-06-20', tasks: tasks1, notes: '眼睛有点肿，冷敷后好转', updatedAt: '2026-06-20 20:00' },
    { date: '2026-06-21', tasks: tasks2, notes: '恢复不错，顾客精神好', updatedAt: '2026-06-21 21:30' }
  ];
};
export const demoDailyCareHistory: Record<string, DailyCareEntry> = {
  '2026-06-20': genDemoDailyCare()[0],
  '2026-06-21': genDemoDailyCare()[1]
};

export const abnormalList: AbnormalItem[] = [
  {
    id: '1',
    type: 'fever',
    title: '🤒 发热',
    emoji: '🤒',
    label: '发热',
    description: '体温超过38度，或感觉浑身发冷',
    firstAction: '先测量体温，多喝水，用温水擦身降温',
    firstSteps: [
      '立即测量体温，记录具体数值',
      '多喝温水，每次100-200毫升',
      '用温水擦颈部、腋下、大腿根帮助降温',
      '不要捂着厚被子，保持通风'
    ],
    contactTime: '2小时内联系门店',
    urgent: true
  },
  {
    id: '2',
    type: 'redness',
    title: '🔴 明显红肿',
    emoji: '🔴',
    label: '明显红肿',
    description: '手术部位越来越红、肿、热、痛',
    firstAction: '先冷敷，不要用手摸，不要涂药膏',
    firstSteps: [
      '用干净毛巾包裹冰袋冷敷15-20分钟',
      '不要用手触摸伤口，避免感染',
      '不要自行涂抹药膏',
      '保持伤口干燥，不要沾水'
    ],
    contactTime: '4小时内联系门店',
    urgent: false
  },
  {
    id: '3',
    type: 'bleeding',
    title: '💧 出血',
    emoji: '💧',
    label: '出血',
    description: '伤口渗血不止，或有血块',
    firstAction: '用干净纱布轻压止血，头稍抬高',
    firstSteps: [
      '用干净纱布或纸巾轻压出血部位',
      '保持头部稍高位，不要低头',
      '持续按压10-15分钟不要松手',
      '如果出血量大、按压不止，立即就医'
    ],
    contactTime: '1小时内联系门店',
    urgent: true
  },
  {
    id: '4',
    type: 'allergy',
    title: '😷 过敏反应',
    emoji: '😷',
    label: '过敏反应',
    description: '全身起疹子、发痒，或呼吸困难',
    firstAction: '停止吃药，不要抓挠，保持皮肤清洁',
    firstSteps: [
      '立即停止服用所有药物',
      '不要抓挠皮肤，防止抓破感染',
      '用凉毛巾擦拭发痒部位',
      '如果出现呼吸困难、胸闷，立即拨打120'
    ],
    contactTime: '2小时内联系门店',
    urgent: true
  },
  {
    id: '5',
    type: 'pain',
    title: '😣 剧烈疼痛',
    emoji: '😣',
    label: '剧烈疼痛',
    description: '止痛药也压不住的剧烈疼痛',
    firstAction: '先吃止痛药，安静休息，不要活动',
    firstSteps: [
      '按医嘱服用止痛药',
      '平躺安静休息，减少活动',
      '不要看手机电视，闭目养神',
      '注意观察是否伴有其他不适'
    ],
    contactTime: '4小时内联系门店',
    urgent: false
  },
  {
    id: '6',
    type: 'other',
    title: '❓ 其他不适',
    emoji: '❓',
    label: '其他不适',
    description: '其他感觉不对劲的情况',
    firstAction: '先休息观察，不要自己处理',
    firstSteps: [
      '先平躺安静休息',
      '不要自行用药或处理',
      '记录不适的具体表现和时间',
      '及时联系护士说明情况'
    ],
    contactTime: '当天联系门店',
    urgent: false
  }
];

export const foodDatabase: FoodItem[] = [
  { id: '1', name: '辣椒', status: 'forbid', reason: '辛辣刺激会引起伤口红肿', suggestion: '术后1个月内避免食用', category: '辛辣', emoji: '🌶️', relatedFoods: ['麻辣火锅', '牛肉'] },
  { id: '2', name: '麻辣火锅', status: 'forbid', reason: '辛辣+高温刺激，严重影响恢复', suggestion: '术后1个月内绝对不能吃', category: '辛辣', emoji: '🍲', relatedFoods: ['辣椒', '牛肉'] },
  { id: '3', name: '白酒', status: 'forbid', reason: '酒精扩张血管，可能出血肿胀', suggestion: '术后2周内严禁喝酒', category: '酒精', emoji: '🍶', relatedFoods: ['啤酒', '虾'] },
  { id: '4', name: '啤酒', status: 'forbid', reason: '含酒精，影响伤口愈合', suggestion: '术后2周内严禁喝', category: '酒精', emoji: '🍺', relatedFoods: ['白酒', '虾'] },
  { id: '5', name: '虾', status: 'forbid', reason: '海鲜容易引起过敏', suggestion: '术后2周内避免食用', category: '海鲜', emoji: '🦐', relatedFoods: ['大闸蟹', '白酒'] },
  { id: '6', name: '大闸蟹', status: 'forbid', reason: '寒性发物，可能引起过敏红肿', suggestion: '术后2周内避免食用', category: '海鲜', emoji: '🦀', relatedFoods: ['虾', '羊肉'] },
  { id: '7', name: '羊肉', status: 'caution', reason: '温补发物，敏感体质可能不适', suggestion: '术后1周后可少量食用，观察反应', category: '肉类', emoji: '🐑', relatedFoods: ['牛肉', '大闸蟹'] },
  { id: '8', name: '牛肉', status: 'caution', reason: '发温之物，部分人吃后红肿', suggestion: '术后1周后可少量食用', category: '肉类', emoji: '🥩', relatedFoods: ['羊肉', '辣椒'] },
  { id: '9', name: '韭菜', status: 'caution', reason: '属于发物，建议少吃', suggestion: '术后1周后可少量吃', category: '蔬菜', emoji: '🥬' },
  { id: '10', name: '鸡蛋', status: 'allow', reason: '优质蛋白质，促进愈合', suggestion: '每天1-2个，蒸煮最好', category: '蛋奶', emoji: '🥚' },
  { id: '11', name: '牛奶', status: 'allow', reason: '补充钙和蛋白质', suggestion: '每天一杯，温热饮用', category: '蛋奶', emoji: '🥛' },
  { id: '12', name: '鸡胸肉', status: 'allow', reason: '优质蛋白，低脂肪', suggestion: '推荐食用，清蒸炖汤最佳', category: '肉类', emoji: '🍗' },
  { id: '13', name: '菠菜', status: 'allow', reason: '含铁和维生素，帮助恢复', suggestion: '推荐食用，焯水后炒或煮汤', category: '蔬菜', emoji: '🥬' },
  { id: '14', name: '苹果', status: 'allow', reason: '维生素C促进伤口愈合', suggestion: '每天一个，常温食用', category: '水果', emoji: '🍎' },
  { id: '15', name: '西兰花', status: 'allow', reason: '维生素丰富，抗氧化', suggestion: '推荐食用，焯水后清炒', category: '蔬菜', emoji: '🥦' },
  { id: '16', name: '人参', status: 'consult', reason: '大补药材，需根据体质判断', suggestion: '咨询医生后再决定是否食用', category: '补品', emoji: '🌿' },
  { id: '17', name: '阿胶', status: 'consult', reason: '补血药材，可能与药物冲突', suggestion: '咨询医生后再食用', category: '补品', emoji: '🍯' },
  { id: '18', name: '深海鱼油', status: 'consult', reason: '可能增加出血风险', suggestion: '咨询医生后再服用', category: '保健品', emoji: '💊' }
];

// 演示用的完整术后计划
const demoSurgeryPlan: SurgeryPlan = {
  stitchRemovalDate: '2026-06-25',
  dailyCareFocus: '每天早晚用生理盐水轻轻清洁伤口，72小时内冷敷，72小时后可热敷。保持伤口干燥，不要沾水。不要低头看手机，枕头垫高。',
  forbiddenInstructions: '拆线前伤口绝对不能沾水；不要用手摸伤口；术后1个月内避免辛辣、酒精、海鲜；不要剧烈运动；不要蒸桑拿、游泳。',
  followUpReminder: '术后7天（6月25日）拆线，术后1个月复查，术后3个月复查。如有异常随时联系。',
  medicationPlan: '头孢克肟：每天2次，每次1粒，吃5天；迈之灵：每天2次，每次2粒，吃7天；止痛药：疼痛时吃1粒'
};

// 演示用的护士回访记录
const demoNurseNotes: NurseFollowUpNote[] = [
  {
    id: 'n1',
    date: '2026-06-19',
    nurseName: '李护士',
    recoveryStatus: '术后第1天，双眼睑肿胀明显，属于正常术后反应，无渗血、无发热。顾客精神状态良好，食欲正常。',
    nextNotes: '继续冷敷，每次15-20分钟，每天3-4次。按时吃药，清淡饮食。如果肿胀持续加重或出现疼痛加剧，及时联系。',
    createdAt: '2026-06-19 15:30'
  },
  {
    id: 'n2',
    date: '2026-06-21',
    nurseName: '李护士',
    recoveryStatus: '术后第3天，肿胀有所消退，左眼淤青轻微吸收，右眼稍明显。伤口干燥无渗液，无感染迹象。',
    nextNotes: '可以开始温热敷帮助淤青吸收，温度不要太高。继续清淡饮食，不要熬夜。6月25日上午10点拆线，请提前到院。',
    createdAt: '2026-06-21 10:15'
  }
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
    recommendFoods: ['鸡蛋', '牛奶', '瘦肉', '蔬菜', '水果'],
    surgeryPlan: demoSurgeryPlan,
    nurseNotes: demoNurseNotes,
    isActive: true
  },
  {
    id: '2',
    projectName: '面部除皱',
    surgeryDate: '2025-11-10',
    doctorName: '李医生',
    nextFollowUp: '2025-11-17',
    notes: '面部表情不要太大，避免大笑。保持伤口干燥清洁。',
    forbidFoods: ['辛辣', '酒精', '海鲜'],
    recommendFoods: ['高蛋白食物', '新鲜蔬果', '胶原蛋白'],
    isActive: false
  }
];

export const abnormalReports: AbnormalReport[] = [
  {
    id: '1',
    type: 'redness',
    typeName: '明显红肿',
    reportTime: '2026-06-20 14:30',
    note: '右眼有点肿',
    status: 'resolved',
    createdAt: new Date('2026-06-20 14:30').getTime()
  }
];

export const mealVoiceReminders = {
  breakfast: '早上好，吃早饭前提醒您：早饭要吃得清淡有营养，可以吃鸡蛋、喝牛奶、喝粥。千万不要吃辣椒、不要喝酒、不要吃海鲜，这些东西会让伤口发炎红肿，恢复得慢。',
  lunch: '中午好，吃午饭前提醒您：午饭可以多吃蔬菜和瘦肉，补充营养帮助伤口长好。切记不要吃辣的、不要喝酒、不要吃虾蟹这些海鲜，吃了会让伤口发红发痒，一定要忍住哦！',
  dinner: '晚上好，吃晚饭前提醒您：晚饭不要吃得太饱太油，多吃清淡的蔬菜汤。绝对不能吃辣椒、生姜、大蒜这些辛辣的东西，也不能喝酒、吃海鲜，不然明天眼睛肿得更厉害了。'
};

// 默认术后计划模板，供护士建档时预填
export const defaultSurgeryPlan: SurgeryPlan = {
  stitchRemovalDate: '',
  dailyCareFocus: '每天早晚用生理盐水轻轻清洁伤口；术后72小时内冷敷，每次15-20分钟，每天3-4次；保持伤口干燥，拆线前不要沾水；枕头垫高，减少肿胀。',
  forbiddenInstructions: '拆线前伤口不能沾水；不要用手触摸伤口；术后1个月内禁食辛辣、酒精、海鲜；避免剧烈运动；不要蒸桑拿、游泳。',
  followUpReminder: '一般术后7天拆线，术后1个月、3个月复查。如有异常随时联系护士。',
  medicationPlan: '遵医嘱服用消炎药和消肿药，疼痛时可服止痛药。'
};
