App({
  globalData: {
    // 后续接入云开发后，将这里的图片配置替换为云存储 fileID。
    assets: {
      mainImage: "/images/teacher-qr-poster.jpg",
      bottomRightImage: "",
    },
  },
  onLaunch() {
    const savedAssets = wx.getStorageSync("page-assets");
    if (savedAssets) {
      this.globalData.assets = { ...this.globalData.assets, ...savedAssets };
    }
  },
});
