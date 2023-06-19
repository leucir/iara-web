const functions = require("firebase-functions");
const {OpenAI} = require("langchain/llms/openai");
const {PromptTemplate} = require("langchain/prompts");
const {LLMChain} = require("langchain/chains");

const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { SerpAPI } = require("langchain/tools");
const { Calculator } = require("langchain/tools/calculator");

exports.testTemplate = functions.https.onRequest(async (req, res) => {

    const model = new OpenAI({openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.7, maxTokens: 100, topP: 1, frequencyPenalty: 0, presencePenalty: 0, stop: ["###"]});
    const prompt = req.body.prompt;

    const template = "What would be a good company name a company that makes {product}?";   

    const promptTemplate = new PromptTemplate({
        template: template,
        inputVariables: ["product"],
    });

    const chain = new LLMChain({llm: model, prompt: promptTemplate});

    const writeResult = await chain.call({product: "cars"});
    console.log(writeResult);

    // Send back a message that we've successfully written the message
    res.json(writeResult);
});

//function to test the agent executor
exports.testAgentExecutor = functions.https.onRequest(async (req, res) => {

    //set an environment variable
    //var os = require('os');
    //os.environ["SERPAPI_API_KEY"] = "BFF65A61E45344128660DD03A8660E45";

    const model = new OpenAI({openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0});
    const tools = [
        new SerpAPI(apiKey=process.env.SERPAPI_API_KEY,{
            location: "Austin, Texas, United States",
            google_domain: "google.com",
            hl: "en",
            gl: "us",
        }),
        new Calculator(),
    ];
    
    const agentExecutor = await initializeAgentExecutorWithOptions(
        tools,
        model,
        {
            agentType: "zero-shot-react-description",
        });

    console.log("Loaded agent executor successfully");

    const input = "Who is Olivia Wilde's boyfriend?" +
    "What is his current age raised to the 0.23 power?";

    console.log(`Executing with input "${input}"...`);

    const writeResult = await agentExecutor.call({ input });
    console.log(`Got output ${writeResult.output}`);

    // Send back a message that we've successfully written the message
    res.json(writeResult.output);

});