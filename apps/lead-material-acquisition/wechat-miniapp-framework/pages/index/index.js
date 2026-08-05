const app = getApp();

Page({
  data: {
    title: "免费领取福利礼包",
    assets: {
      mainImage: "",
      bottomRightImage: "",
    },
  },

  onLoad() {
    this.setData({
      assets: { ...this.data.assets, ...app.globalData.assets },
    });
  },

  openAdmin() {
    wx.navigateTo({ url: "/pages/admin/index" });
  },
});
