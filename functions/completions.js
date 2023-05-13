const { Configuration, OpenAIApi } = require("openai");

/*
* OpenAI using SDK
*/
exports.textCompletionsDavinciSdk = (async (promptCorpus, modelParams={}) => {

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: promptCorpus,
        temperature: 0.7,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["###"],
        });

    //Returning a promise
    return response;
});






