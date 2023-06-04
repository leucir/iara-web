require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});

const completions = require("./completions");
const { getArgumentation } = require("./utils/argumentation");

//Returns a parsed prompt, based on the product params
exports.chat = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const max_tokens = 100;
    let text = req.query.text;
    let historyTalk = req.query.historyTalk;
    console.log(getArgumentation(historyTalk))
    text = `${getArgumentation(historyTalk, max_tokens)}, agora responda essa pergunta ou afirmação baseada no contexto acima: \"${text}\"`;
    const response = await completions.textCompletionsDavinciSdk(text, {temperature: 0.1});
    const nTokens = await completions.countTokens(text);

    historyTalk = `${historyTalk || ''}\nuser: ${req.query.text} openai:${response.data.choices[0].text}`
    res.json({ result: response.data.choices[0].text, nTokens, historyTalk });
  })
});
