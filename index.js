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

const client = new Client(lineConfig);

async function appendToGoogleSheet(text, userId, timestamp) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()
      );
      await doc.useServiceAccountAuth(credentials);
    }
    
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    await sheet.addRow({
      '時間': new Date(timestamp).toLocaleString('zh-TW'),
      '用戶ID': userId,
      '訊息內容': text
    });
    
    console.log('訊息已儲存到 Google Sheets');
  } catch (error) {
    console.error('儲存到 Google Sheets 時發生錯誤:', error);
  }
}

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text;
  const userId = event.source.userId;
  const timestamp = event.timestamp;

  await appendToGoogleSheet(text, userId, timestamp);

  const replyMessage = {
    type: 'text',
    text: `已儲存您的訊息到 Google Sheets：\n「${text}」`
  };

  return client.replyMessage(event.replyToken, replyMessage);
}

app.use(middleware(lineConfig));

app.post('/webhook', (req, res) => {
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