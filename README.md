# LINE Bot to Google Sheets

一個能將 LINE Bot 收到的訊息自動儲存到 Google Sheets 的應用程式。

## 功能特色

- 接收 LINE Bot 的文字訊息
- 自動儲存到指定的 Google Sheets
- 記錄時間戳記和用戶 ID
- 支援 Zeabur 一鍵部署

## 快速開始

1. 克隆此儲存庫
2. 安裝依賴：`npm install`
3. 按照 `SETUP.md` 的指示設置 Google Sheets API 和 LINE Bot
4. 複製 `.env.example` 為 `.env` 並填入必要資訊
5. 本地測試：`npm run dev`
6. 部署到 Zeabur

詳細設置說明請參考 [SETUP.md](./SETUP.md)

## 檔案結構

```
linebot/
├── index.js          # 主應用程式
├── package.json      # 專案配置
├── .env.example      # 環境變數範例
├── .gitignore        # Git 忽略檔案
├── SETUP.md          # 詳細設置指南
└── README.md         # 專案說明
```

## 技術棧

- Node.js + Express
- LINE Bot SDK
- Google Sheets API
- Zeabur 部署平台