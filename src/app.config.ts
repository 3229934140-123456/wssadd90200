export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/food/index',
    'pages/family/index',
    'pages/abnormal/index',
    'pages/mine/index',
    'pages/nurse-setup/index',
    'pages/record-detail/index',
    'pages/abnormal-detail/index',
    'pages/food-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B9D',
    navigationBarTitleText: '术后关怀助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF5F7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B9D',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '今日提醒'
      },
      {
        pagePath: 'pages/food/index',
        text: '查食物'
      },
      {
        pagePath: 'pages/family/index',
        text: '家属端'
      },
      {
        pagePath: 'pages/abnormal/index',
        text: '异常上报'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
