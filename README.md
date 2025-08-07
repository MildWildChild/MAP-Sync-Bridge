# MAP Sync Bridge

🚀 This repository syncs content from Notion into GitHub Issues in real-time via GitHub Actions.

## How It Works

- Listens for Notion database updates (via schedule)
- Creates a GitHub Issue for each update
- Keeps a transparent log between platforms

## Setup

1. Upload this folder to your GitHub repository
2. Set two GitHub secrets:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
3. Trigger the workflow manually or wait for the 5-minute sync

Developed by MildWildChild 🧬