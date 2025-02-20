const {OpenAI} = require('openai')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
require('dotenv').config()

const PORT = process.env.PORT || 3000

const app = express()

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

app.post('/message', async (req, res) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'user',
                content: req.body.message
            }
        ]
    })
    res.send({message: response.choices[0].message.content})
})

app.listen(PORT, () => {
    console.log(`PORT listening to ${PORT}`);
})