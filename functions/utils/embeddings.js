/*
 This script is only to generate embeddings for stateless requests.
 It doesn't persist them anywhere.
 It is mostly used to vectorize inputs coming from the end-user layer (UI/API)
 */

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const api = new OpenAIApi(configuration);

exports.getVector = async function(text) {

    console.log(`\x1b[32mRetrieving embeddings from OpenAI.\x1b[0m`);

    const response = await api.createEmbedding({
        'model': 'text-embedding-ada-002',
        'input': text,
    });
    console.log(`\x1b[32mEmbeddings retrieved.\x1b[0m`);

    return response.data.data[0].embedding;
}
