import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import CareTaskItem from '@/components/CareTaskItem';
import BigButton from '@/components/BigButton';
import { formatDate, getDaysAfter, makePhoneCall, speakText } from '@/utils';
import { mealVoiceReminders, todayForbidList, todayCautionList, todayRecommendList } from '@/data/mockData';

const FamilyPage: React.FC = () => {
  const { userInfo, careTasks, toggleCareTask, resetCareTasks } = useAppContext();
  const [noteText, setNoteText] = useState('');

  const daysAfter = useMemo(() => getDaysAfter(userInfo.surgeryDate), [userInfo.surgeryDate]);

  const completedCount = careTasks.filter((t) => t.checked).length;
  const totalCount = careTasks.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;

  const handleNotifyUser = () => {
    console.log('[家属端] 提醒顾客');
    const forbidText = todayForbidList.map((w) => w.foods.join('、')).join('、');
    const msg = `${userInfo.name}您好，今天是术后第${daysAfter}天，请记得不要吃${forbidText}，按时吃药，多休息哦！`;
    speakText(msg);
    Taro.showToast({ title: '已提醒顾客', icon: 'success' });
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      Taro.showToast({ title: '请输入备注内容', icon: 'none' });
      return;
    }
    console.log('[家属端] 保存备注:', noteText);
    Taro.showToast({ title: '已保存', icon: 'success' });
    setNoteText('');
  };

  const handleCheckAll = () => {
    Taro.showModal({
      title: '提示',
      content: allDone ? '确定要重置所有任务吗？重置后可重新勾选。' : '确定要标记全部任务已完成吗？',
      success: (res) => {
        if (res.confirm) {
          if (allDone) {
            resetCareTasks();
            Taro.showToast({ title: '已重置，可重新勾选', icon: 'success' });
          } else {
            careTasks.forEach((task) => {
              if (!task.checked) {
                toggleCareTask(task.id);
              }
            });
            Taro.showToast({ title: '全部完成！', icon: 'success' });
          }
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Text className={styles.cardTitle}>👨‍👩‍👧 您正在照顾</Text>
          <Text className={styles.userName}>{userInfo.name} · {userInfo.age}岁</Text>
          <Text className={styles.userInfo}>
            📋 {userInfo.projectName}
            {'\n'}🗓️ 手术日：{formatDate(userInfo.surgeryDate)}（术后第{daysAfter}天）
            {'\n'}🏥 {userInfo.storeName}
          </Text>
        </View>

        <View className={styles.syncBanner}>
          <View className={styles.syncLeft}>
            <Text className={styles.syncIcon}>🔄</Text>
            <View>
              <Text className={styles.syncText}>与顾客端已同步</Text>
              <Text className={styles.syncSubText}>您勾选的任务会同步给护士</Text>
            </View>
          </View>
          <View className={styles.syncStatus}>
            <View className={styles.statusDot} />
            <Text className={styles.statusText}>同步中</Text>
          </View>
        </View>
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>💡 今日照护重点提醒</Text>
        <Text className={styles.tipsText}>
          1. 保证顾客饮食清淡，不要吃辛辣、酒精、海鲜类食物{'\n'}
          2. 提醒顾客按时服用消炎药和消肿药{'\n'}
          3. 每日观察术区，如有异常及时联系护士{'\n'}
          4. 让顾客多休息，避免剧烈运动和低头
        </Text>
      </View>

      {allDone && (
        <View className={styles.doneBanner}>
          <Text className={styles.doneIcon}>🎉</Text>
          <View>
            <Text className={styles.doneText}>太棒了！今日任务已全部完成</Text>
            <Text className={styles.doneSub}>您是最贴心的家属，继续加油！</Text>
          </View>
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>✅ 今日照护清单</Text>
        <Text className={styles.progressBadge} onClick={handleCheckAll}>
          {completedCount}/{totalCount} {allDone ? '重置' : '全部完成'}
        </Text>
      </View>

      <View className={styles.progressBar}>
        <View className={styles.progressFill} style={{ width: `${progress}%` }} />
      </View>

      {careTasks.map((task) => (
        <CareTaskItem key={task.id} data={task} onToggle={toggleCareTask} />
      ))}

      <View style={{ marginTop: 16 }}>
        <BigButton
          text={allDone ? '完成情况已同步给护士' : '提醒顾客注意饮食和吃药'}
          icon={allDone ? '✅' : '📢'}
          type={allDone ? 'success' : 'primary'}
          onClick={handleNotifyUser}
          disabled={false}
        />
      </View>

      <View className={styles.reminderSection}>
        <Text className={styles.titleText}>📢 同步提醒记录</Text>
      </View>

      <View className={styles.reminderCard}>
        <View className={styles.reminderHeader}>
          <Text className={styles.reminderTitle}>
            <Text className={styles.reminderIcon}>🌅</Text> 早饭前提醒
          </Text>
          <Text className={styles.reminderTime}>已读 · 07:30</Text>
        </View>
        <Text className={styles.reminderContent}>{mealVoiceReminders.breakfast}</Text>
        <View className={styles.reminderActions}>
          <View className={`${styles.reminderBtn} ${styles.reminderBtnPrimary}`} onClick={() => speakText(mealVoiceReminders.breakfast)}>
            <Text className={styles.reminderBtnText}>🔊 再播一次</Text>
          </View>
          <View className={`${styles.reminderBtn} ${styles.reminderBtnDefault}`} onClick={() => Taro.showToast({ title: '已确认', icon: 'success' })}>
            <Text className={styles.reminderBtnText}>👌 顾客已收到</Text>
          </View>
        </View>
      </View>

      <View className={styles.reminderCard}>
        <View className={styles.reminderHeader}>
          <Text className={styles.reminderTitle}>
            <Text className={styles.reminderIcon}>☀️</Text> 午饭前提醒
          </Text>
          <Text className={styles.reminderTime}>待提醒 · 11:30</Text>
        </View>
        <Text className={styles.reminderContent}>{mealVoiceReminders.lunch}</Text>
        <View className={styles.reminderActions}>
          <View className={`${styles.reminderBtn} ${styles.reminderBtnPrimary}`} onClick={() => speakText(mealVoiceReminders.lunch)}>
            <Text className={styles.reminderBtnText}>📢 立即提醒</Text>
          </View>
          <View className={`${styles.reminderBtn} ${styles.reminderBtnDefault}`}>
            <Text className={styles.reminderBtnText}>⏰ 稍后提醒</Text>
          </View>
        </View>
      </View>

      <View className={styles.reminderCard}>
        <View className={styles.reminderHeader}>
          <Text className={styles.reminderTitle}>
            <Text className={styles.reminderIcon}>🌙</Text> 晚饭前提醒
          </Text>
          <Text className={styles.reminderTime}>待提醒 · 17:30</Text>
        </View>
        <Text className={styles.reminderContent}>{mealVoiceReminders.dinner}</Text>
        <View className={styles.reminderActions}>
          <View className={`${styles.reminderBtn} ${styles.reminderBtnPrimary}`} onClick={() => speakText(mealVoiceReminders.dinner)}>
            <Text className={styles.reminderBtnText}>📢 立即提醒</Text>
          </View>
          <View className={`${styles.reminderBtn} ${styles.reminderBtnDefault}`}>
            <Text className={styles.reminderBtnText}>⏰ 稍后提醒</Text>
          </View>
        </View>
      </View>

      <View className={styles.noteSection}>
        <Text className={styles.titleText}>📝 今日观察记录</Text>
      </View>
      <View className={styles.noteCard}>
        <Text className={styles.noteTitle}>记录顾客今天的状态（护士可以看到）</Text>
        <Input
          type="textarea"
          className={styles.noteInput}
          placeholder="例如：今天状态不错，胃口挺好，眼睛还有点肿，不出血。"
          value={noteText}
          onInput={(e) => setNoteText(e.detail.value)}
          maxlength={500}
        />
        <View style={{ marginTop: 24 }}>
          <BigButton text="保存观察记录给护士看" icon="💾" type="default" onClick={handleSaveNote} />
        </View>
      </View>

      <View className={styles.contactSection}>
        <Text className={styles.titleText}>📞 紧急联系方式</Text>
      </View>

      <View className={styles.contactCard}>
        <Text className={styles.contactTitle}>遇到问题请及时联系：</Text>
        <View className={styles.contactRow}>
          <View className={styles.contactInfo}>
            <Text className={styles.contactIcon}>👩‍⚕️</Text>
            <View>
              <Text className={styles.contactName}>{userInfo.nurseName}</Text>
              <Text className={styles.contactRole}>负责护士 · {userInfo.storeName}</Text>
            </View>
          </View>
          <View className={styles.contactBtn} onClick={() => makePhoneCall(userInfo.nursePhone)}>
            <Text className={styles.contactBtnText}>📞 拨打</Text>
          </View>
        </View>
        {userInfo.familyName && (
          <View style={{ marginTop: 16, borderTop: '2rpx solid #F2F3F5', paddingTop: 16 }}>
            <View className={styles.contactRow}>
              <View className={styles.contactInfo}>
                <Text className={styles.contactIcon}>🏥</Text>
                <View>
                  <Text className={styles.contactName}>门店前台</Text>
                  <Text className={styles.contactRole}>24小时值班电话</Text>
                </View>
              </View>
              <View className={styles.contactBtn} onClick={() => makePhoneCall('400-888-9999')}>
                <Text className={styles.contactBtnText}>📞 拨打</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default FamilyPage;
