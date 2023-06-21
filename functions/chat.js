require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const {PromptTemplate, PipelinePromptTemplate} = require("langchain/prompts");

const limits = require("./db/limits-db");
const addons = require("./db/addons-db");
const products = require("./db/products-db");
const supported_topics = require("./db/supported-topics-db");

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


exports.chat2 = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    const context = {
      clientUUID : "9823dfd-2323-2323-2323-2323232323",
      offeringID : "offering_noroeste",
      domainType : "realestate",
      entities: [
          'products',
          'contato',
          'construtoras',
          'products_extra'
      ]
    };

    //retrieve input from the request
    const input = req.body.input;

    const fullPrompt = PromptTemplate.fromTemplate("" +
    "{supported_topics} " +
    "{limits_generic} " +
    "{introduction} " + 
    "{list_of_products} " +
    "{addons} " +
    "{limits_around_topics} " +
    " ###" +
    input
    );

    const introductionPrompt = PromptTemplate.fromTemplate('{introduction}');
    const listOfProductsPrompt = PromptTemplate.fromTemplate('{list_of_products}');
    const addonsPrompt = PromptTemplate.fromTemplate('{addons}');
    const supportedTopicsPrompt = PromptTemplate.fromTemplate('{supported_topics}');
    const limitsAroundTopicsPrompt = PromptTemplate.fromTemplate('{limits_around_topics}');
    const limitsGenericPrompt = PromptTemplate.fromTemplate('{limits_generic}');

    const composedPrompt = new PipelinePromptTemplate({
      pipelinePrompts: [
        {
          name: "supported_topics",
          prompt: supportedTopicsPrompt,
        },
        {
          name: "introduction",
          prompt: introductionPrompt,
        },
        {
          name: "list_of_products",
          prompt: listOfProductsPrompt,
        },
        {
          name: "addons",
          prompt: addonsPrompt,
        },
        {
          name: "limits_around_topics",
          prompt: limitsAroundTopicsPrompt,
        },
        {
          name: "limits_generic",
          prompt: limitsGenericPrompt,
        },
      ],  
      finalPrompt: fullPrompt,
    });

    const limitsGeneric = await limits.getLimits("realestate", "pt_br");
    const listOfProducts = await products.getProductsUsingEmbedding(context, input)
    const addOns = await addons.getAddons("offering_noroeste");
    const supportedTopics = await supported_topics.getSupportedTopics("offering_noroeste");

    const formattedPrompt = await composedPrompt.format({
      supported_topics: supportedTopics,
      limits_generic: limitsGeneric,
      introduction: "",
      list_of_products: listOfProducts,
      addons: addOns,
      limits_around_topics: "",
    });

    console.log(formattedPrompt);

    //res.send(formattedPrompt);
    //res.end();

      //Call LLM service
      const response = await completions.textCompletionsDavinciSdk(formattedPrompt, {temperature: 0.1});

      //Send back the response
      res.json({ result: response.data.choices[0].text });
    
    }) //end of cors
  }); //end of exports.chat2