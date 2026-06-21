import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import FoodResultCard from '@/components/FoodResultCard';
import { foodDatabase } from '@/data/mockData';
import type { FoodItem } from '@/types';
import { getStatusText, speakText } from '@/utils';

const hotFoods = ['羊肉', '牛肉', '辣椒', '白酒', '鸡蛋', '牛奶', '虾', '大闸蟹', '人参', '阿胶'];

const cleanFoodQuery = (raw: string): string => {
  return raw
    .replace(/能不能吃|能不能喝|可以吃吗|可以喝吗|能吃吗|能喝吗|能不能|可以吗|行不行|[？?。！!，,吗呢吧啊呀哦嘛]/g, '')
    .trim();
};

const searchFood = (query: string): FoodItem | null => {
  const cleaned = cleanFoodQuery(query);
  if (!cleaned) return null;

  let result = foodDatabase.find((item) => item.name === cleaned);
  if (result) return result;

  result = foodDatabase.find((item) => cleaned.includes(item.name));
  if (result) return result;

  result = foodDatabase.find((item) => item.name.includes(cleaned));
  if (result) return result;

  const aliases: Record<string, string> = {
    '辣': '辣椒', '辣的': '辣椒', '辛辣': '辣椒',
    '酒': '白酒', '喝酒': '白酒', '红酒': '白酒', '黄酒': '白酒', '酒精': '白酒',
    '海鲜': '虾', '螃蟹': '大闸蟹', '蟹': '大闸蟹', '贝类': '虾',
    '牛': '牛肉', '猪': '鸡胸肉', '鸡': '鸡胸肉', '鸡肉': '鸡胸肉',
    '蔬菜': '菠菜', '水果': '苹果', '补品': '人参',
    '火锅': '麻辣火锅',
  };
  const aliasTarget = aliases[cleaned];
  if (aliasTarget) {
    result = foodDatabase.find((item) => item.name === aliasTarget);
    if (result) return result;
  }

  return null;
};

const FoodPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<FoodItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>(['羊肉', '辣椒', '鸡蛋']);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const handleSearch = (keyword: string = searchText) => {
    const query = keyword.trim();
    if (!query) {
      Taro.showToast({ title: '请输入食物名称', icon: 'none' });
      return;
    }
    setSearched(true);
    setVoiceError('');

    const result = searchFood(query);

    if (result) {
      setSearchResult(result);
      const displayQuery = cleanFoodQuery(query) || query;
      if (!history.includes(displayQuery)) {
        setHistory((prev) => [displayQuery, ...prev].slice(0, 10));
      }
      const resultText = `${result.name}，${getStatusText(result.status)}。${result.reason}。${result.suggestion}`;
      speakText(resultText);
    } else {
      const displayQuery = cleanFoodQuery(query) || query;
      setSearchResult({
        id: 'unknown',
        name: displayQuery,
        status: 'consult',
        reason: `暂时没有"${displayQuery}"的饮食记录，为了您的安全，`,
        suggestion: '建议咨询您的护士或医生，确认后再食用',
        category: '未知'
      });
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) return;
    setIsRecording(true);
    setVoiceError('');

    const plugin = Taro.requirePlugin('WechatSI');
    if (plugin) {
      const manager = plugin.getRecordRecognitionManager();
      manager.onRecognize((res: any) => {
        const text = res?.result || '';
        if (text) {
          setSearchText(text);
        }
      });
      manager.onStop((res: any) => {
        setIsRecording(false);
        Taro.hideLoading();
        const text = res?.result || '';
        if (text.trim()) {
          setSearchText(text.trim());
          Taro.showToast({ title: '识别成功', icon: 'success' });
          setTimeout(() => handleSearch(text.trim()), 500);
        } else {
          setVoiceError('没有听清您说的话，请再试一次，或者手动输入食物名称');
          Taro.showToast({ title: '未识别到内容，请重试', icon: 'none', duration: 2500 });
        }
      });
      manager.onError((err: any) => {
        setIsRecording(false);
        Taro.hideLoading();
        console.error('[语音识别失败]', err);
        setVoiceError('语音识别失败，请再试一次，或者手动输入食物名称');
        Taro.showToast({ title: '识别失败，请重试或手动输入', icon: 'none', duration: 2500 });
      });
      Taro.showLoading({ title: '正在听您说话...' });
      manager.start({ lang: 'zh_CN' });
      setTimeout(() => {
        if (isRecording) {
          manager.stop();
        }
      }, 6000);
    } else {
      Taro.showModal({
        title: '语音识别',
        content: '当前环境不支持语音识别插件，是否使用微信原生录音？',
        success: (modalRes) => {
          if (modalRes.confirm) {
            fallbackVoiceInput();
          } else {
            setIsRecording(false);
            setVoiceError('语音识别不可用，请手动输入食物名称');
          }
        }
      });
    }
  };

  const fallbackVoiceInput = () => {
    Taro.startRecord({
      success: () => {
        setIsRecording(false);
        Taro.hideLoading();
        Taro.showModal({
          title: '语音输入',
          editable: true,
          placeholderText: '请输入您想问的食物，如：羊肉能不能吃',
          success: (res) => {
            if (res.content && res.content.trim()) {
              const text = res.content.trim();
              setSearchText(text);
              Taro.showToast({ title: '已收到', icon: 'success' });
              setTimeout(() => handleSearch(text), 500);
            } else {
              setVoiceError('未输入内容，请再试一次');
              Taro.showToast({ title: '未输入内容', icon: 'none' });
            }
          }
        });
      },
      fail: () => {
        setIsRecording(false);
        Taro.hideLoading();
        setVoiceError('录音失败，请手动输入食物名称');
        Taro.showToast({ title: '录音失败，请手动输入', icon: 'none' });
      },
      complete: () => {
        Taro.stopRecord();
      }
    });
  };

  const handleStopVoice = () => {
    setIsRecording(false);
    Taro.hideLoading();
    Taro.stopRecord();
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

        <View
          className={styles.voiceBtn}
          onClick={isRecording ? handleStopVoice : handleVoiceInput}
        >
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text className={styles.voiceBtnIcon}>{isRecording ? '🎙️' : '🎤'}</Text>
            <Text className={styles.voiceBtnText}>
              {isRecording ? '正在听您说话...点击结束' : '按住说话，问食物能不能吃'}
            </Text>
          </View>
          <Text className={styles.voiceBtnSub}>比如问：羊肉能不能吃？白酒能不能喝？</Text>
        </View>

        {voiceError && (
          <View style={{
            marginTop: 16,
            padding: '20rpx 24rpx',
            backgroundColor: '#FFF7E8',
            borderRadius: 12,
            border: '2rpx solid #FF7D00'
          }}>
            <Text style={{ fontSize: 26, color: '#FF7D00', lineHeight: 1.6 }}>⚠️ {voiceError}</Text>
          </View>
        )}
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
              · <Text className={styles.exampleHighlight}>白酒能不能喝？</Text>
            </Text>
          </View>
          <View className={styles.exampleItem}>
            <Text className={styles.exampleText}>
              · <Text className={styles.exampleHighlight}>辣椒可以吃吗？</Text>
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
