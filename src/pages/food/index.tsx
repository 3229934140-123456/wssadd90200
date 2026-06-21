import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import FoodResultCard from '@/components/FoodResultCard';
import { foodDatabase } from '@/data/mockData';
import type { FoodItem } from '@/types';
import { getStatusText, speakText } from '@/utils';

const hotFoods = ['羊肉', '牛肉', '辣椒', '白酒', '鸡蛋', '牛奶', '虾', '大闸蟹', '人参', '阿胶'];

const FoodPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<FoodItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>(['羊肉', '辣椒', '鸡蛋']);
  const [isRecording, setIsRecording] = useState(false);

  const handleSearch = (keyword: string = searchText) => {
    const query = keyword.trim();
    if (!query) {
      Taro.showToast({ title: '请输入食物名称', icon: 'none' });
      return;
    }
    console.log('[查食物] 查询:', query);
    setSearched(true);

    const cleanQuery = query.replace(/能不能吃|能不能喝|可以吃吗|可以喝吗|能吃吗|能喝吗|[？?]/g, '').trim();

    const result = foodDatabase.find(
      (item) =>
        item.name === cleanQuery ||
        cleanQuery.includes(item.name) ||
        item.name.includes(cleanQuery)
    );

    if (result) {
      setSearchResult(result);
      if (!history.includes(cleanQuery)) {
        setHistory((prev) => [cleanQuery, ...prev].slice(0, 10));
      }
      const resultText = `${result.name}，${getStatusText(result.status)}。${result.reason}`;
      speakText(resultText);
    } else {
      setSearchResult({
        id: 'unknown',
        name: cleanQuery,
        status: 'consult',
        reason: `暂时没有"${cleanQuery}"的记录，为了您的安全，`,
        suggestion: '建议咨询您的护士或医生，确认后再食用',
        category: '未知'
      });
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    Taro.showLoading({ title: '正在听...' });
    console.log('[语音输入] 启动录音');

    setTimeout(() => {
      const mockResults = ['羊肉能不能吃', '牛肉可以吃吗', '辣椒能吃吗', '鸡蛋能吃吗', '白酒可以喝吗'];
      const randomQuery = mockResults[Math.floor(Math.random() * mockResults.length)];
      setSearchText(randomQuery);
      setIsRecording(false);
      Taro.hideLoading();
      Taro.showToast({ title: '识别成功', icon: 'success' });
      setTimeout(() => handleSearch(randomQuery), 500);
    }, 1500);
  };

  const handleHotClick = (food: string) => {
    setSearchText(food);
    handleSearch(food);
  };

  const clearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setHistory([]);
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.searchSection}>
        <Text className={styles.searchTitle}>🔍 查一查，能不能吃</Text>
        <Text className={styles.searchSubtitle}>
          想吃的东西不确定？输入或语音问问，马上告诉你能不能吃！
        </Text>

        <View className={styles.searchBox}>
          <View className={styles.inputWrap}>
            <Text className={styles.searchIcon}>🍽️</Text>
            <Input
              className={styles.searchInput}
              placeholder="如：羊肉能不能吃"
              placeholderClass="search-placeholder"
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
              onConfirm={() => handleSearch()}
              confirmType="search"
            />
          </View>
          <View className={styles.searchBtn} onClick={() => handleSearch()}>
            <Text className={styles.searchBtnText}>查询</Text>
          </View>
        </View>

        <View className={styles.voiceBtn} onClick={handleVoiceInput}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text className={styles.voiceBtnIcon}>{isRecording ? '🎙️' : '🎤'}</Text>
            <Text className={styles.voiceBtnText}>
              {isRecording ? '正在听您说话...' : '按住说话，问食物能不能吃'}
            </Text>
          </View>
          <Text className={styles.voiceBtnSub}>比如问：羊肉能不能吃？</Text>
        </View>
      </View>

      <View className={styles.exampleBox}>
        <Text className={styles.exampleTitle}>💡 这样问我就能听懂</Text>
        <View className={styles.exampleList}>
          <View className={styles.exampleItem}>
            <Text className={styles.exampleText}>
              · <Text className={styles.exampleHighlight}>羊肉能不能吃？</Text>
            </Text>
          </View>
          <View className={styles.exampleItem}>
            <Text className={styles.exampleText}>
              · <Text className={styles.exampleHighlight}>辣椒可以吃吗？</Text>
            </Text>
          </View>
          <View className={styles.exampleItem}>
            <Text className={styles.exampleText}>
              · <Text className={styles.exampleHighlight}>白酒能喝吗？</Text>
            </Text>
          </View>
          <View className={styles.exampleItem}>
            <Text className={styles.exampleText}>
              · <Text className={styles.exampleHighlight}>人参可以吃吗？</Text>
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.hotSection}>
        <Text className={styles.hotTitle}>🔥 大家都在查</Text>
        <View className={styles.hotList}>
          {hotFoods.map((food, idx) => (
            <View
              key={idx}
              className={styles.hotItem}
              onClick={() => handleHotClick(food)}
            >
              <Text className={styles.hotItemText}>{food}</Text>
            </View>
          ))}
        </View>
      </View>

      {searched && (
        <View className={styles.resultSection}>
          <Text className={styles.hotTitle}>📋 查询结果</Text>
          {searchResult ? (
            <FoodResultCard data={searchResult} />
          ) : null}
        </View>
      )}

      {!searched && (
        <View className={styles.resultEmpty}>
          <Text className={styles.emptyIcon}>🍱</Text>
          <Text className={styles.emptyText}>
            输入食物名称
            {'\n'}或点击语音按钮询问
            {'\n'}马上知道能不能吃！
          </Text>
        </View>
      )}

      {history.length > 0 && (
        <View className={styles.historySection}>
          <View className={styles.historyTitle}>
            <Text className={styles.historyTitleText}>🕐 搜索历史</Text>
            <Text className={styles.clearHistory} onClick={clearHistory}>清空</Text>
          </View>
          <View className={styles.historyList}>
            {history.map((item, idx) => (
              <View
                key={idx}
                className={styles.historyItem}
                onClick={() => handleHotClick(item)}
              >
                <Text className={styles.historyText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.legendSection}>
        <Text className={styles.legendTitle}>📌 结果说明</Text>
        <View className={styles.legendList}>
          <View className={styles.legendItem}>
            <View className={styles.legendBadge} style={{ backgroundColor: '#00B42A' }} />
            <Text className={styles.legendText}>✅ 可以吃 — 放心食用，帮助恢复</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendBadge} style={{ backgroundColor: '#FF7D00' }} />
            <Text className={styles.legendText}>⚠️ 暂缓食用 — 术后一周后再少量吃</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendBadge} style={{ backgroundColor: '#F53F3F' }} />
            <Text className={styles.legendText}>❌ 不能吃 — 严重影响恢复，一定忍住</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendBadge} style={{ backgroundColor: '#165DFF' }} />
            <Text className={styles.legendText}>ℹ️ 咨询医生 — 建议问过护士再决定</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default FoodPage;
