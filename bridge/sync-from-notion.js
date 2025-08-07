// sync-from-notion.js
// Placeholder script to fetch Notion page updates and create GitHub issues
const { Client } = require("@notionhq/client");
const { Octokit } = require("@octokit/rest");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;
const repo = process.env.GITHUB_REPOSITORY || "MildWildChild/MAP-Sync-Bridge";
const [owner, repoName] = repo.split("/");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function sync() {
  console.log("Syncing from Notion...");

  const response = await notion.databases.query({ database_id: databaseId });
  const page = response.results[0];
  const title = page.properties?.Name?.title?.[0]?.plain_text || "Untitled";
  const body = "Synced from Notion at " + new Date().toISOString();

  await octokit.issues.create({
    owner,
    repo: repoName,
    title: `🧠 ${title}`,
    body,
  });

  console.log("Sync complete.");
}

sync().catch(console.error);