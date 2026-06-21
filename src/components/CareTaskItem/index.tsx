import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { CareTask } from '@/types';
import classnames from 'classnames';

interface Props {
  data: CareTask;
  onToggle: (id: string) => void;
}

const CareTaskItem: React.FC<Props> = ({ data, onToggle }) => {
  return (
    <View
      className={classnames(styles.taskItem, data.checked && styles.checked)}
      onClick={() => onToggle(data.id)}
    >
      <View className={styles.checkBox}>
        <Text className={classnames(styles.checkIcon, data.checked && styles.checkedIcon)}>
          {data.checked ? '✓' : ''}
        </Text>
      </View>
      <View className={styles.taskInfo}>
        <Text className={styles.taskTitle}>{data.title}</Text>
        <Text className={styles.taskDesc}>{data.description}</Text>
        {data.checked && data.checkedTime && (
          <Text className={styles.checkedTime}>✅ {data.checkedTime} 已完成</Text>
        )}
      </View>
    </View>
  );
};

export default CareTaskItem;
