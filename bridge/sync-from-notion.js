// bridge/sync-from-notion.js
// 拉取 Notion 页面的代码块中以 #AviaToCat: 开头的指令，并转发到 GitHub Issues

const axios = require("axios");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PAGE_ID = process.env.NOTION_PAGE_ID;
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. owner/repo

if (!NOTION_TOKEN || !PAGE_ID || !GITHUB_PAT || !GITHUB_REPO) {
  console.error("❌ 环境变量缺失。需要 NOTION_TOKEN / NOTION_PAGE_ID / GITHUB_PAT / GITHUB_REPO");
  process.exit(1);
}

const NOTION_VER = "2022-06-28";

async function fetchChildren(blockId, startCursor = undefined, acc = []) {
  const url = `https://api.notion.com/v1/blocks/${blockId}/children`;
  const params = startCursor ? { start_cursor: startCursor } : {};
  const res = await axios.get(url, {
    params,
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VER
    }
  });
  const data = res.data;
  acc.push(...data.results);
  if (data.has_more) {
    return fetchChildren(blockId, data.next_cursor, acc);
  }
  return acc;
}

function extractAviaToCatDirective(blocks) {
  // 在页面 block 中寻找 code 块，读取内容行，找以 #AviaToCat: 开头的行
  for (const b of blocks) {
    if (b.type === "code" && b.code && b.code.rich_text && b.code.rich_text.length) {
      const text = b.code.rich_text.map(t => t.plain_text).join("");
      const lines = text.split(/\r?\n/).map(s => s.trim());
      for (const line of lines) {
        if (line.startsWith("#AviaToCat:")) {
          return line.replace("#AviaToCat:", "").trim();
        }
      }
    }
  }
  // 退而求其次：普通段落里也找一行 #AviaToCat:
  for (const b of blocks) {
    if (b.type === "paragraph" && b.paragraph?.rich_text?.length) {
      const text = b.paragraph.rich_text.map(t => t.plain_text).join("");
      const idx = text.indexOf("#AviaToCat:");
      if (idx >= 0) {
        return text.slice(idx + "#AviaToCat:".length).trim();
      }
    }
  }
  return null;
}

async function createIssue(message) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/issues`
  const title = `Avia→Cat: ${message}`.slice(0, 80);
  const body = [
    `**Relay from Notion @ ${new Date().toISOString()}**`,
    ``,
    `> ${message}`,
    ``,
    `labels: tail-relay`
  ].join("\n");

  await axios.post(url, { title, body, labels: ["tail-relay"] }, {
    headers: {
      "Authorization": `Bearer ${GITHUB_PAT}`,
      "Accept": "application/vnd.github+json"
    }
  });
  console.log("📨 已转发到 GitHub Issues：", title);
}

async function main() {
  try {
    console.log("🔎 拉取 Notion 页面…", PAGE_ID);
    const blocks = await fetchChildren(PAGE_ID);
    const directive = extractAviaToCatDirective(blocks);
    if (!directive) {
      console.log("ℹ️ 未发现 #AviaToCat 指令，跳过。");
      return;
    }
    console.log("✅ 发现指令：", directive);
    await createIssue(directive);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error("❌ 同步失败：", msg);
    process.exitCode = 1;
  }
}

main();
