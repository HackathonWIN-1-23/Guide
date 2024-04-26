const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const config = require("./config");
const usersRouter = require("./routers/users");
const OpenAI = require("openai");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/users', usersRouter);

const openai = new OpenAI({
  apiKey: 'sk-proj-ELRt38l1QIHA6goiz3UST3BlbkFJRBZIcMWkY4g3U2U5Bc4m', // This is the default and can be omitted
});

app.get('/ask', async (req, res) => {
  try {
    // const { question } = req.body;
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'gpt-3.5-turbo',
    });

    res.json({ answer: chatCompletion.data.choices[0].message.content });
  } catch (error) {
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