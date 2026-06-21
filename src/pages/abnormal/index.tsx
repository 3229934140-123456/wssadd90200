import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import BigButton from '@/components/BigButton';
import { abnormalList } from '@/data/mockData';
import type { AbnormalItem } from '@/types';
import { makePhoneCall, getNowTimeStr, getTodayStr } from '@/utils';
import classnames from 'classnames';

const AbnormalPage: React.FC = () => {
  const { userInfo, reports, addReport } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<AbnormalItem | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [noteText, setNoteText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (item: AbnormalItem) => {
    setSelectedItem(item);
    setSubmitted(false);
    setPhotos([]);
    setNoteText('');
    console.log('[异常上报] 选择:', item.title);
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 3,
      success: (res) => {
        const newPhotos = res.tempFilePaths || [];
        setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3));
        console.log('[异常上报] 选择图片:', newPhotos);
      },
      fail: (err) => {
        console.error('[异常上报] 图片选择失败:', err);
      }
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!selectedItem) {
      Taro.showToast({ title: '请先选择异常情况', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认提交',
      content: `确定提交"${selectedItem.title}"吗？提交后护士会尽快联系您。`,
      success: (res) => {
        if (res.confirm) {
          const report = {
            id: Date.now().toString(),
            type: selectedItem.type,
            typeName: selectedItem.title.replace(/[🤒🔴💧😷😣❓]/g, '').trim(),
            reportTime: `${getTodayStr()} ${getNowTimeStr()}`,
            photos,
            note: noteText,
            status: 'submitted' as const
          };
          addReport(report);
          setSubmitted(true);
          Taro.showToast({ title: '提交成功！护士会尽快联系您', icon: 'success', duration: 2500 });
          console.log('[异常上报] 提交成功:', report);
        }
      }
    });
  };

  const handleCallNurse = () => {
    makePhoneCall(userInfo.nursePhone);
  };

  const handleCallEmergency = () => {
    makePhoneCall('120');
  };

  const handleReset = () => {
    setSelectedItem(null);
    setSubmitted(false);
    setPhotos([]);
    setNoteText('');
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.warnBanner}>
        <Text className={styles.bannerTitle}>🚨 身体不舒服？不要慌！</Text>
        <Text className={styles.bannerText}>
          术后有些不适是正常的，请先选择您遇到的情况，
          {'\n'}系统会告诉您先做什么，以及多久内要联系护士。
          {'\n'}情况紧急请直接拨打护士电话！
        </Text>
      </View>

      <View className={styles.urgentTip}>
        <Text className={styles.urgentTipIcon}>⚠️</Text>
        <Text className={styles.urgentTipText}>
          紧急情况请直接拨打护士电话：{userInfo.nursePhone}
        </Text>
      </View>

      <Text className={styles.sectionTitle}>👇 请选择您遇到的情况</Text>

      <View className={styles.grid}>
        {abnormalList.map((item) => (
          <View
            key={item.id}
            className={classnames(
              styles.abnormalCard,
              item.urgent && styles.urgentCard,
              selectedItem?.id === item.id && styles.selectedCard
            )}
            onClick={() => handleSelect(item)}
          >
            {item.urgent && <View className={styles.urgentBadge}>紧急</View>}
            <Text className={styles.abnormalIcon}>{item.title.split(' ')[0]}</Text>
            <Text className={styles.abnormalTitle}>
              {item.title.replace(/[🤒🔴💧😷😣❓]/g, '').trim()}
            </Text>
            <Text className={styles.abnormalDesc}>{item.description}</Text>
          </View>
        ))}
      </View>

      {selectedItem && !submitted && (
        <>
          <Text className={styles.sectionTitle}>📋 处理指导</Text>
          <View className={styles.detailCard}>
            <View className={styles.detailHeader}>
              <Text className={styles.detailIcon}>{selectedItem.title.split(' ')[0]}</Text>
              <View className={styles.detailInfo}>
                <Text className={styles.detailName}>
                  {selectedItem.title.replace(/[🤒🔴💧😷😣❓]/g, '').trim()}
                </Text>
                <Text className={styles.detailTime}>⏰ {selectedItem.contactTime}</Text>
              </View>
            </View>

            <View className={styles.actionSection}>
              <Text className={styles.actionLabel}>✅ 请先这样做：</Text>
              <Text className={styles.actionText}>{selectedItem.firstAction}</Text>
            </View>

            <View className={styles.contactSection}>
              <Text className={styles.contactLabel}>📞 然后联系门店：</Text>
              <Text className={styles.contactText}>
                {selectedItem.contactTime}内必须联系{userInfo.nurseName}
                {'\n'}电话：{userInfo.nursePhone}
              </Text>
            </View>
          </View>

          <View className={styles.photoSection}>
            <Text className={styles.photoLabel}>📷 拍照上传术区状态（选填，最多3张）</Text>
            <View className={styles.photoBox}>
              {photos.map((photo, idx) => (
                <View
                  key={idx}
                  className={classnames(styles.photoItem, styles.photoImage)}
                  onClick={() => handleRemovePhoto(idx)}
                  style={{ backgroundImage: `url(${photo})`, backgroundColor: '#f2f3f5' }}
                >
                  <Text className={styles.photoPlus}>点击删除</Text>
                </View>
              ))}
              {photos.length < 3 && (
                <View
                  className={classnames(styles.photoItem, styles.emptyPhoto)}
                  onClick={handleChooseImage}
                >
                  <Text className={styles.photoPlus}>+</Text>
                </View>
              )}
            </View>
          </View>

          <View className={styles.noteSection}>
            <Text className={styles.noteLabel}>📝 补充说明（选填）</Text>
            <Input
              type="textarea"
              className={styles.noteInput}
              placeholder="请描述一下具体情况，比如哪里不舒服、持续多久了等"
              value={noteText}
              onInput={(e) => setNoteText(e.detail.value)}
              maxlength={500}
            />
          </View>

          <BigButton text="提交上报，通知护士" icon="✅" type="danger" onClick={handleSubmit} />
          <View style={{ height: 16 }} />
          <BigButton text="直接拨打护士电话" icon="📞" type="warning" onClick={handleCallNurse} />
          {selectedItem.urgent && (
            <>
              <View style={{ height: 16 }} />
              <BigButton text="紧急情况？拨打120" icon="🚑" type="danger" onClick={handleCallEmergency} />
            </>
          )}
          <View style={{ height: 16 }} />
          <BigButton text="重新选择" icon="↩️" type="default" onClick={handleReset} />
        </>
      )}

      {submitted && selectedItem && (
        <View style={{ marginTop: 24 }}>
          <View className={styles.detailCard} style={{ borderColor: '#00B42A', backgroundColor: '#F6FFED' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '32rpx 0' }}>
              <Text style={{ fontSize: 80, marginBottom: 16 }}>✅</Text>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#00B42A', marginBottom: 8 }}>
                上报成功！
              </Text>
              <Text style={{ fontSize: 28, color: '#4E5969', textAlign: 'center', lineHeight: '1.8' }}>
                {userInfo.nurseName}已经收到您的上报
                {'\n'}会在{selectedItem.contactTime}内联系您
                {'\n'}请保持电话畅通
              </Text>
            </View>
            <View style={{ marginTop: 24 }}>
              <BigButton text="拨打护士电话确认" icon="📞" type="primary" onClick={handleCallNurse} />
              <View style={{ height: 16 }} />
              <BigButton text="返回重新上报其他情况" icon="↩️" type="default" onClick={handleReset} />
            </View>
          </View>
        </View>
      )}

      <View className={styles.historySection}>
        <Text className={styles.sectionTitle}>📜 历史上报记录</Text>
        {reports.length === 0 ? (
          <View style={{ padding: 48, textAlign: 'center', backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)' }}>
            <Text style={{ fontSize: 64 }}>📭</Text>
            <Text style={{ fontSize: 28, color: '#86909C', marginTop: 16 }}>
              暂无上报记录
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} className={styles.historyItem}>
              <View className={styles.historyDot}>
                <Text className={styles.historyDotIcon}>📋</Text>
              </View>
              <View className={styles.historyContent}>
                <Text className={styles.historyTitle}>{report.typeName}</Text>
                <Text className={styles.historyTime}>{report.reportTime}</Text>
                {report.note && (
                  <Text style={{ fontSize: 24, color: '#4E5969', marginTop: 8, display: 'block' }}>
                    备注：{report.note}
                  </Text>
                )}
                <Text className={styles.historyStatus}>
                  {report.status === 'submitted' ? '⏳ 待回复' : report.status === 'replied' ? '💬 已回复' : '✅ 已解决'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default AbnormalPage;
