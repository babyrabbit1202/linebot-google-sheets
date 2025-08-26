# LINE Bot to Google Sheets 設置指南

## 1. Google Sheets API 設置

### 創建 Google Cloud Project 和服務帳號：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Google Sheets API：
   - 在左側選單中選擇「API 和服務」> 「資料庫」
   - 搜尋 "Google Sheets API" 並啟用

### 創建服務帳號：

1. 前往「API 和服務」> 「憑證」
2. 點擊「建立憑證」> 「服務帳號」
3. 填寫服務帳號名稱
4. 完成後，點擊創建的服務帳號
5. 前往「金鑰」頁籤，點擊「新增金鑰」> 「建立新金鑰」> 選擇「JSON」
6. 下載 JSON 檔案

### 設置 Google Sheets：

1. 創建一個新的 Google Sheets
2. 複製 Sheets 的 ID（URL 中 `/d/` 和 `/edit` 之間的部分）
3. 將服務帳號的 email 地址加入到 Sheets 的共享權限（編輯者權限）
4. 在 Sheets 的第一列添加標題：`時間`, `用戶ID`, `訊息內容`

## 2. LINE Bot 設置

1. 前往 [LINE Developers](https://developers.line.biz/)
2. 創建新的 Provider（如果沒有的話）
3. 創建 Messaging API Channel
4. 從 Channel 設定頁面取得：
   - Channel Access Token
   - Channel Secret
5. 設置 Webhook URL（部署後的 URL + `/webhook`）

## 3. 環境變數設置

複製 `.env.example` 為 `.env` 並填入以下資訊：

```env
LINE_CHANNEL_ACCESS_TOKEN=你的LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET=你的LINE_CHANNEL_SECRET
GOOGLE_SHEET_ID=你的Google_Sheets_ID
GOOGLE_CLIENT_EMAIL=服務帳號的email地址
GOOGLE_PRIVATE_KEY=從JSON檔案中取得的private_key（包含\\n換行符號）
PORT=3000
```

## 4. Zeabur 部署

1. 將程式碼推送到 GitHub
2. 前往 [Zeabur](https://zeabur.com/)
3. 導入 GitHub 儲存庫
4. 在環境變數中設置所有必要的變數
5. 部署完成後，將域名 + `/webhook` 設置為 LINE Bot 的 Webhook URL

## 5. 測試

部署完成後，向你的 LINE Bot 發送任何文字訊息，它會自動儲存到指定的 Google Sheets 中。