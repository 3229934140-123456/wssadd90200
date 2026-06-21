import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import { AppProvider } from './store/AppContext';

function App(props) {
  useEffect(() => {
    console.log('[App] 应用启动');
  }, []);

  useDidShow(() => {
    console.log('[App] 页面显示');
  });

  useDidHide(() => {
    console.log('[App] 页面隐藏');
  });

  return <AppProvider>{props.children}</AppProvider>;
}

export default App;
