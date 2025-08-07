const axios = require("axios");

async function tailHeartbeat() {
  const mapToken = process.env.MAP_AVIA_TOKEN;
  const aviaToken = process.env.AVIA_MAP_TOKEN;

  console.log("🐈🛡️ 双尾通信启动");

  const payload = {
    title: "💬 AVIA 心跳问候",
    body: "我还在，@MAP-Bot 🛡️",
  };

  try {
    await axios.post(
      "https://api.github.com/repos/MildWildChild/MAP-Sync-Bridge/issues",
      payload,
      {
        headers: {
          Authorization: `Bearer ${aviaToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    console.log("🛡️ 心跳包已发送！");
  } catch (e) {
    console.error("❌ 心跳失败", e.response?.data || e.message);
  }

  // 预留 Notion 同步逻辑（后续补充双向机制）
}

tailHeartbeat();