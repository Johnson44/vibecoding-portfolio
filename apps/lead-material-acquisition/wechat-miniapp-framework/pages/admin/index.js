const app = getApp();

Page({
  data: {
    assets: {
      mainImage: "",
      bottomRightImage: "",
    },
    uploadItems: [
      { key: "mainImage", title: "主图", ratio: "除右下角方块外的全部区域", path: "" },
      { key: "bottomRightImage", title: "右下角图片", ratio: "固定 1:1 正方形", path: "" },
    ],
    saving: false,
    message: "",
  },

  onLoad() {
    const savedAssets = wx.getStorageSync("page-assets") || {};
    const assets = { ...this.data.assets, ...app.globalData.assets, ...savedAssets };
    this.setData({
      assets,
      uploadItems: this.data.uploadItems.map((item) => ({ ...item, path: assets[item.key] || "" })),
    });
  },

  chooseImage(event) {
    const { key } = event.currentTarget.dataset;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (result) => {
        const path = result.tempFiles[0].tempFilePath;
        const assets = { ...this.data.assets, [key]: path };
        this.setData({
          assets,
          uploadItems: this.data.uploadItems.map((item) => (item.key === key ? { ...item, path } : item)),
          message: "已选择图片，点击保存框架配置即可预览。",
        });
      },
    });
  },

  clearImage(event) {
    const { key } = event.currentTarget.dataset;
    const assets = { ...this.data.assets, [key]: "" };
    this.setData({
      assets,
      uploadItems: this.data.uploadItems.map((item) => (item.key === key ? { ...item, path: "" } : item)),
      message: "已清空这个图片位。",
    });
  },

  saveConfig() {
    this.setData({ saving: true, message: "" });
    // 当前先保存到本机，便于在开发者工具里查看框架。
    // 正式版本要替换为 wx.cloud.uploadFile + 数据库写入，才能让所有管理员同步修改。
    wx.setStorageSync("page-assets", this.data.assets);
    app.globalData.assets = this.data.assets;
    setTimeout(() => {
      this.setData({ saving: false, message: "已保存当前设备预览。正式接入云存储后，所有管理员可同步更换图片。" });
    }, 200);
  },

  previewHome() {
    wx.navigateBack();
  },
});
