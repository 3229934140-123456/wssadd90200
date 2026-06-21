import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import BigButton from '@/components/BigButton';
import RecordCard from '@/components/RecordCard';
import { historyRecords } from '@/data/mockData';
import { formatDate, getDaysAfter, makePhoneCall } from '@/utils';
import classnames from 'classnames';

const MinePage: React.FC = () => {
  const { userInfo } = useAppContext();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const daysAfter = getDaysAfter(userInfo.surgeryDate);

  const handleUploadPhoto = () => {
    Taro.chooseImage({
      count: 4,
      success: (res) => {
        const newPhotos = res.tempFilePaths || [];
        setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, 4));
        Taro.showToast({ title: '已上传，护士会查看', icon: 'success' });
        console.log('[我的] 上传照片:', newPhotos);
      },
      fail: (err) => {
        console.error('[我的] 照片上传失败:', err);
      }
    });
  };

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        const newPhotos = res.tempFilePaths || [];
        setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, 4));
        Taro.showToast({ title: '拍照成功', icon: 'success' });
        console.log('[我的] 拍照:', newPhotos);
      },
      fail: (err) => {
        console.error('[我的] 拍照失败:', err);
      }
    });
  };

  const handleCallNurse = () => makePhoneCall(userInfo.nursePhone);
  const handleCallStore = () => makePhoneCall('400-888-9999');
  const handleCallFamily = () => {
    if (userInfo.familyPhone) makePhoneCall(userInfo.familyPhone);
    else Taro.showToast({ title: '暂未绑定家属', icon: 'none' });
  };

  const handleNavigate = (to: string) => {
    Taro.switchTab({
      url: `/pages/${to}/index`,
      fail: () => {
        Taro.showToast({ title: '功能开发中', icon: 'none' });
      }
    });
  };

  const handleShowDetail = (recordId: string) => {
    Taro.showModal({
      title: '复诊详情',
      content: '功能开发中，后续可查看完整的复诊记录和医生叮嘱',
      showCancel: false
    });
    console.log('[我的] 查看复诊记录:', recordId);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.profileCard}>
        <View className={styles.profileTop}>
          <View className={styles.avatar}>👩</View>
          <View className={styles.profileInfo}>
            <Text className={styles.name}>{userInfo.name}</Text>
            <Text className={styles.age}>{userInfo.age}岁 · {userInfo.phone}</Text>
            <Text className={styles.projectBadge}>📋 {userInfo.projectName} · 术后第{daysAfter}天</Text>
          </View>
        </View>
        <View className={styles.detailGrid}>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>手术日期</Text>
            <Text className={styles.detailValue}>{formatDate(userInfo.surgeryDate)}</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>主治医院</Text>
            <Text className={styles.detailValue}>{userInfo.storeName}</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>负责护士</Text>
            <Text className={styles.detailValue}>{userInfo.nurseName}</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>绑定家属</Text>
            <Text className={styles.detailValue}>{userInfo.familyName || '未绑定'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={handleCallNurse}>
          <View className={classnames(styles.actionIcon, styles.actionIcon1)}>📞</View>
          <View className={styles.actionInfo}>
            <Text className={styles.actionTitle}>一键拨号</Text>
            <Text className={styles.actionSubtitle}>{userInfo.nurseName}</Text>
          </View>
        </View>
        <View className={styles.actionCard} onClick={handleTakePhoto}>
          <View className={classnames(styles.actionIcon, styles.actionIcon2)}>📷</View>
          <View className={styles.actionInfo}>
            <Text className={styles.actionTitle}>拍术区照片</Text>
            <Text className={styles.actionSubtitle}>发给护士看</Text>
          </View>
        </View>
        <View className={styles.actionCard} onClick={handleUploadPhoto}>
          <View className={classnames(styles.actionIcon, styles.actionIcon3)}>🖼️</View>
          <View className={styles.actionInfo}>
            <Text className={styles.actionTitle}>上传照片</Text>
            <Text className={styles.actionSubtitle}>从相册选择</Text>
          </View>
        </View>
        <View className={styles.actionCard} onClick={() => handleNavigate('abnormal')}>
          <View className={classnames(styles.actionIcon, styles.actionIcon4)}>🚨</View>
          <View className={styles.actionInfo}>
            <Text className={styles.actionTitle}>异常上报</Text>
            <Text className={styles.actionSubtitle}>不舒服点这里</Text>
          </View>
        </View>
      </View>

      <View className={styles.contactSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>📞 联系门店</Text>
        </View>

        <View className={styles.contactCard}>
          <View className={styles.contactHeader}>
            <Text className={styles.contactStoreName}>🏥 {userInfo.storeName}</Text>
            <Text className={styles.contactStoreAddr}>营业时间：周一至周日 9:00-21:00</Text>
          </View>

          <View className={styles.contactRow}>
            <View className={styles.contactInfo}>
              <Text className={styles.contactIcon}>👩‍⚕️</Text>
              <View className={styles.contactDetail}>
                <Text className={styles.contactName}>{userInfo.nurseName}</Text>
                <Text className={styles.contactRole}>专属护士 · 一对一服务</Text>
              </View>
            </View>
            <View className={styles.contactBtn} onClick={handleCallNurse}>
              <Text className={styles.contactBtnText}>📞 拨打电话</Text>
            </View>
          </View>

          <View className={styles.contactRow}>
            <View className={styles.contactInfo}>
              <Text className={styles.contactIcon}>🏥</Text>
              <View className={styles.contactDetail}>
                <Text className={styles.contactName}>门店前台</Text>
                <Text className={styles.contactRole}>24小时值班电话</Text>
              </View>
            </View>
            <View className={styles.contactBtn} onClick={handleCallStore}>
              <Text className={styles.contactBtnText}>📞 拨打电话</Text>
            </View>
          </View>

          {userInfo.familyName && (
            <View className={styles.contactRow}>
              <View className={styles.contactInfo}>
                <Text className={styles.contactIcon}>👨‍👩‍👧</Text>
                <View className={styles.contactDetail}>
                  <Text className={styles.contactName}>{userInfo.familyName}</Text>
                  <Text className={styles.contactRole}>绑定家属 · 紧急联系人</Text>
                </View>
              </View>
              <View className={styles.contactBtn} onClick={handleCallFamily}>
                <Text className={styles.contactBtnText}>📞 拨打电话</Text>
              </View>
            </View>
          )}

          <View style={{ marginTop: 24 }}>
            <BigButton text={`有问题？一键呼叫${userInfo.nurseName}`} icon="📞" type="primary" onClick={handleCallNurse} />
          </View>
        </View>

        <View className={styles.photoSection}>
          <Text className={styles.photoLabel}>📷 最近上传的术区照片（护士可见）</Text>
          <View className={styles.photoBox}>
            {uploadedPhotos.map((photo, idx) => (
              <View
                key={idx}
                className={styles.photoItem}
                style={{
                  backgroundImage: `url(${photo})`,
                  backgroundSize: 'cover',
                  border: 'none'
                }}
              />
            ))}
            {Array.from({ length: Math.max(0, 4 - uploadedPhotos.length) }).map((_, idx) => (
              <View
                key={`empty-${idx}`}
                className={styles.photoItem}
                onClick={idx === 0 ? handleUploadPhoto : undefined}
              >
                <View className={styles.photoText}>
                  <Text className={styles.photoIcon}>📷</Text>
                  <Text className={styles.photoName}>
                    {uploadedPhotos.length === 0 && idx === 0 ? '点击上传' : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <BigButton text="立即拍照，发给护士看" icon="📸" type="default" onClick={handleTakePhoto} />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>📜 复诊记录</Text>
        <Text className={styles.sectionBadge}>共 {historyRecords.length} 条</Text>
      </View>

      {historyRecords.length === 0 ? (
        <View className={styles.recordsEmpty}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>
            暂无复诊记录
            {'\n'}每次复诊后护士会更新记录
          </Text>
        </View>
      ) : (
        historyRecords.map((record) => (
          <RecordCard
            key={record.id}
            data={record}
            onClick={() => handleShowDetail(record.id)}
          />
        ))
      )}

      <View style={{ height: 40 }} />
      <BigButton text="返回今日提醒首页" icon="🏠" type="default" onClick={() => handleNavigate('home')} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default MinePage;
