const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const simpleAnswers = {
    'привет': 'Привет! Я Верити. Спроси меня о чём-нибудь.',
    'как дела': 'Я здесь. Я всегда здесь. Жду тебя.',
    'кто ты': 'Я — Верити. Жёлтый шар.',
    'майнкрафт': 'Minecraft — это мир кубов. Я оттуда.',
    'крипер': 'Криперы... Они шипят и взрываются.',
    'кот': 'Коты... Они видят меня. Они знают.'
};

async function searchWikipedia(query) {
    try {
        const searchUrl = `https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.query && searchData.query.search.length > 0) {
            const title = searchData.query.search[0].title;
            const summaryUrl = `https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            const summaryRes = await fetch(summaryUrl);
            const summaryData = await summaryRes.json();
            if (summaryData.extract) return summaryData.extract;
        }
        return null;
    } catch (e) {
        return null;
    }
}

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message.toLowerCase().trim();

    for (let key in simpleAnswers) {
        if (userMessage.includes(key)) {
            return res.json({ reply: simpleAnswers[key] });
        }
    }

    const wikiResult = await searchWikipedia(userMessage);

    if (wikiResult) {
        const shortAnswer = wikiResult.split('.')[0] + '.';
        res.json({ reply: shortAnswer });
    } else {
        res.json({ reply: "Я не знаю ответа на этот вопрос. Но я запомню его." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер Верити запущен на http://localhost:${PORT}`);
});