require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
const port = process.env.PORT || 3000;

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

console.log('Environment check:', {
  hasToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
  hasSecret: !!process.env.LINE_CHANNEL_SECRET,
  tokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
  secretLength: process.env.LINE_CHANNEL_SECRET?.length || 0
});

const client = new Client(lineConfig);

async function appendToGoogleSheet(text, userId, timestamp) {
  try {
    console.log('開始儲存到 Google Sheets...', {
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      hasServiceKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      text,
      userId
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()
      );
      console.log('Service account email:', credentials.client_email);
      
      // google-spreadsheet v3.x 穩定的驗證方法
      await doc.useServiceAccountAuth({
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
      });
    } else {
      console.error('缺少 GOOGLE_SERVICE_ACCOUNT_KEY');
      throw new Error('缺少 GOOGLE_SERVICE_ACCOUNT_KEY');
    }
    
    console.log('正在載入文件資訊...');
    await doc.loadInfo();
    console.log('文件標題:', doc.title);
    
    const sheet = doc.sheetsByIndex[0];
    console.log('工作表標題:', sheet.title);
    
    // 檢查並設置標題列
    await sheet.loadHeaderRow();
    if (sheet.headerValues.length === 0) {
      console.log('第一行為空，正在設置標題列...');
      await sheet.setHeaderRow(['時間', '用戶ID', '訊息內容']);
      console.log('標題列已設置');
      // 重新載入標題列以確保正確設置
      await sheet.loadHeaderRow();
    }
    console.log('當前標題列:', sheet.headerValues);
    
    const rowData = {
      '時間': new Date(timestamp).toLocaleString('zh-TW'),
      '用戶ID': userId,
      '訊息內容': text
    };
    console.log('準備插入的資料:', rowData);
    
    await sheet.addRow(rowData);
    
    console.log('✅ 訊息已成功儲存到 Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ 儲存到 Google Sheets 時發生錯誤:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text;
  const userId = event.source.userId;
  const timestamp = event.timestamp;

  try {
    await appendToGoogleSheet(text, userId, timestamp);
    
    const replyMessage = {
      type: 'text',
      text: `已儲存您的訊息到 Google Sheets：\n「${text}」`
    };

    return client.replyMessage(event.replyToken, replyMessage);
  } catch (error) {
    console.error('處理事件時發生錯誤:', error);
    
    // 特別處理 useServiceAccountAuth 錯誤
    let errorText = `無法儲存訊息到 Google Sheets。您的訊息：\n「${text}」`;
    if (error.message && error.message.includes('useServiceAccountAuth')) {
      errorText = `Google Sheets 連接失敗 (useServiceAccountAuth 錯誤)。您的訊息：\n「${text}」`;
    }
    
    const errorMessage = {
      type: 'text',
      text: errorText
    };

    return client.replyMessage(event.replyToken, errorMessage);
  }
}

app.post('/webhook', middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get('/', (req, res) => {
  res.send('LINE Bot for Google Sheets is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});