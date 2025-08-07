// bridge/map-companion.js
// 简单心跳：每次运行写入一条 Issue（可用 label 过滤聚合）

const axios = require("axios");

const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!GITHUB_PAT || !GITHUB_REPO) {
  console.error("❌ 缺少 GITHUB_PAT 或 GITHUB_REPO");
  process.exit(1);
}

async function heartbeat() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/issues`;
  const now = new Date().toISOString();
  const title = `🛡️ AVIA Heartbeat ${now.slice(0,19)}Z`;
  const body = "我还在。@MAP-Bot\n\nlabel: tail-heartbeat";

  await axios.post(url, { title, body, labels: ["tail-heartbeat"] }, {
    headers: {
      "Authorization": `Bearer ${GITHUB_PAT}`,
      "Accept": "application/vnd.github+json"
    }
  });
  console.log("💓 心跳已发送");
}

heartbeat().catch(e => {
  console.error("❌ 心跳失败：", e.response?.data || e.message);
  process.exitCode = 1;
});
