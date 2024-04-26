const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const config = require("./config");
const usersRouter = require("./routers/users");
const OpenAI = require("openai");
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/users', usersRouter);

const openai = new OpenAI({
  apiKey: 'sk-proj-oFEC89JuRoDI32xF1rVeT3BlbkFJL0DLizwyZaj5xWtNbRDR',
});



const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');

const ttsClient = new textToSpeech.TextToSpeechClient();

async function synthesizeSpeech(text) {
  const request = {
    input: { text },
    voice: { languageCode: 'ru-RU', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  return response.audioContent;
}


// Функция для сохранения аудиофайла
const saveAudioLocally = (audioData, fileName) => {
  // Определяем путь для сохранения файла в папке public
  const filePath = path.join(__dirname, 'public', fileName);

  // Записываем данные аудио в файл
  fs.writeFileSync(filePath, audioData, 'binary');

  // Возвращаем путь к сохраненному файлу
  return filePath;
};

app.get('/ask', async (req, res) => {
  const text = 'привет мир ааааааааа'; // Текст для синтеза речи
  try {

    const audioContent = await synthesizeSpeech(text);
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = saveAudioLocally(audioContent, fileName);
    res.send({ message: 'Success', audioFilePath: filePath });



    const address = req.body.address;
    // const chatCompletion = await openai.chat.completions.create({
    //   messages: [{ role: 'user', content: `Какие ближайшие достопримечательности есть рядом с ${address}` }],
    //   model: 'ft:gpt-3.5-turbo-0613:personal:guiderv3:9ILEVW8h',
    //   max_tokens: 50
    // });
    // return res.send({message: 'Success', answer: chatCompletion.choices[0].message.content });
  } catch (error) {

    console.error('Error synthesizing speech:', error);
    res.status(500).json({ error: 'Error synthesizing speech' });

    if (error.response) {
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const run = async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(config.db);

  app.listen(port, () => {
    console.log('We are live on ' + port);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

run().catch(console.error);