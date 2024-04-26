const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const config = require("./config");
const usersRouter = require("./routers/users");
const OpenAI = require("openai");
require('dotenv').config();

const app = express();
const port = 8000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/users', usersRouter);

const openai = new OpenAI({
  apiKey: 'sk-proj-oFEC89JuRoDI32xF1rVeT3BlbkFJL0DLizwyZaj5xWtNbRDR',
});

app.post('/ask', async (req, res) => {
  try {
    const address = req.body.address;
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `Какие ближайшие достопримечательности есть рядом с ${address}` }],
      model: 'ft:gpt-3.5-turbo-0613:personal:guiderv3:9ILEVW8h',
      max_tokens: 50
    });

    return res.send({message: 'Success', answer: chatCompletion.choices[0].message.content });
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