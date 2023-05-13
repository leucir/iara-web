const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const { Configuration, OpenAIApi } = require("openai");

const axios = require('axios');
const config = {
    headers : {Authorization: 'Bearer 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'}
};

/*
* OpenAI using API calls
*/
exports.davinciApi = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== "GET") {
          return res.status(401).json({
            message: "Not allowed"
          });
        }

        return axios.post('https://api.openai.com/v1/completions',
        {
            "model": "text-davinci-003",
            "prompt": "Trying to understand the big bang. Do you have examples?",
            "max_tokens": 7,
            "temperature": 2,
            "top_p": 1,
            "n": 1,
            "stream": false,
            "logprobs": null,
            "stop": "\n"
        },
        config)
        .then(response => {
            console.log(response.data);
            return res.status(200).json({
            message: response.data
            })
        })
        .catch(err => {
            return res.status(500).json({
            error: err
            })
        }) 
    })  

});



/*
* OpenAI using SDK
*/
exports.davinciSdk = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        return res.status(401).json({
        message: "Not allowed"
        });
    }

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"Unknown\".\n\nQ: What is human life expectancy in the United States?\nA: Human life expectancy in the United States is 78 years.\n\nQ: Who was president of the United States in 1955?\nA: Dwight D. Eisenhower was president of the United States in 1955.\n\nQ: Which party did he belong to?\nA: He belonged to the Republican Party.\n\nQ: What is the square root of banana?\nA: Unknown\n\nQ: How does a telescope work?\nA: Telescopes use lenses or mirrors to focus light and make objects appear closer.\n\nQ: Where were the 1992 Olympics held?\nA: The 1992 Olympics were held in Barcelona, Spain.\n\nQ: How many squigs are in a bonk?\nA: Unknown\n\nQ:",
        temperature: 0,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["\n"],
        })
        .then(response => {
            console.log(response.data);
            return res.status(200).json({
            message: response.data
            })
        })
        .catch(err => {
            return res.status(500).json({
            error: err
            })
        });
});






