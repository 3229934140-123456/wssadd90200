import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface Props {
  text: string;
  type?: 'primary' | 'success' | 'danger' | 'warning' | 'default';
  icon?: string;
  onClick?: () => void;
  full?: boolean;
  disabled?: boolean;
}

const BigButton: React.FC<Props> = ({
  text,
  type = 'primary',
  icon,
  onClick,
  full = true,
  disabled = false
}) => {
  return (
    <View
      className={classnames(
        styles.bigBtn,
        styles[type],
        full && styles.full,
        disabled && styles.disabled
      )}
      onClick={() => !disabled && onClick?.()}
    >
      {icon && <Text className={styles.icon}>{icon}</Text>}
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default BigButton;
