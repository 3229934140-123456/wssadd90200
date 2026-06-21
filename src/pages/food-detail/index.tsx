import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import BigButton from '@/components/BigButton';
import FoodResultCard from '@/components/FoodResultCard';
import { foodDatabase } from '@/data/mockData';
import { getStatusText } from '@/utils';

const FoodDetailPage: React.FC = () => {
  const handleBack = () => {
    Taro.navigateBack({ delta: 1, fail: () => Taro.switchTab({ url: '/pages/food/index' }) });
  };

  const seafood = foodDatabase.find((f) => f.name === '海鲜') || foodDatabase[3];
  const spicy = foodDatabase.find((f) => f.name === '辣椒') || foodDatabase[1];
  const alcohol = foodDatabase.find((f) => f.name === '酒精') || foodDatabase[2];
  const chicken = foodDatabase.find((f) => f.name === '鸡肉') || foodDatabase[4];

  const similarFoods = useMemo(() => {
    if (seafood?.relatedFoods) {
      return seafood.relatedFoods
        .map((name) => foodDatabase.find((f) => f.name === name))
        .filter(Boolean);
    }
    return [];
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'allowed':
        return styles.statusAllowed;
      case 'warning':
        return styles.statusWarning;
      case 'forbidden':
        return styles.statusForbidden;
      default:
        return styles.statusConsult;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.backBtn} onClick={handleBack}>
        <Text style={{ fontSize: 28 }}>←</Text>
        <Text className={styles.backText}>返回查食物</Text>
      </View>

      <View className={styles.heroWrapper}>
        <FoodResultCard food={seafood} highlight />
      </View>

      <Text className={styles.cardTitle}>🥘 类似食物</Text>
      <View className={styles.relatedList}>
        <View className={styles.relatedItem}>
          <Text className={styles.relatedEmoji}>{spicy.emoji}</Text>
          <View className={styles.relatedInfo}>
            <Text className={styles.relatedName}>{spicy.name}</Text>
            <Text className={styles.relatedReason}>{spicy.reason.slice(0, 18)}...</Text>
          </View>
          <View className={getStatusBadgeClass(spicy.status)}>
            {getStatusText(spicy.status)}
          </View>
        </View>

        <View className={styles.relatedItem}>
          <Text className={styles.relatedEmoji}>{alcohol.emoji}</Text>
          <View className={styles.relatedInfo}>
            <Text className={styles.relatedName}>{alcohol.name}</Text>
            <Text className={styles.relatedReason}>{alcohol.reason.slice(0, 18)}...</Text>
          </View>
          <View className={getStatusBadgeClass(alcohol.status)}>
            {getStatusText(alcohol.status)}
          </View>
        </View>

        <View className={styles.relatedItem}>
          <Text className={styles.relatedEmoji}>{chicken.emoji}</Text>
          <View className={styles.relatedInfo}>
            <Text className={styles.relatedName}>{chicken.name}</Text>
            <Text className={styles.relatedReason}>{chicken.reason.slice(0, 18)}...</Text>
          </View>
          <View className={getStatusBadgeClass(chicken.status)}>
            {getStatusText(chicken.status)}
          </View>
        </View>
      </View>

      <Text className={styles.nutritionTitle}>💡 营养建议</Text>
      <View className={styles.nutritionTags}>
        <View className={styles.nutritionTag}>高蛋白</View>
        <View className={styles.nutritionTag}>补锌</View>
        <View className={styles.nutritionTag}>维生素B族</View>
        <View className={styles.nutritionTag}>清淡为主</View>
        <View className={styles.nutritionTag}>多喝水</View>
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsText}>
          <Text className={styles.tipsIcon}>💡</Text>
          {'\n'}
          术后恢复期间，建议多吃新鲜蔬菜水果、鸡蛋、瘦肉等高蛋白食物，
          保证充足睡眠，心情愉快，恢复更快！
          {'\n\n'}
          如有任何疑问，请直接联系您的专属护士，我们会第一时间为您解答。
        </Text>
      </View>

      <BigButton
        text="语音播报忌口原因"
        icon="🔊"
        type="default"
        onClick={() => {
          Taro.showToast({ title: `海鲜：${seafood.reason}`, icon: 'none', duration: 3000 });
        }}
      />
    </ScrollView>
  );
};

export default FoodDetailPage;
