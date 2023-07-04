require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const {PromptTemplate, PipelinePromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} = require("langchain/prompts");
const {ChatOpenAI} = require("langchain/chat_models/openai");
const {HumanChatMessage, AIChatMessage, SystemChatMessage} = require("langchain/schema");

const introduction = require("./db/introduction-db");
const limits = require("./db/limits-db");
const addons = require("./db/addons-db");
const products = require("./db/products-db");
const supported_topics = require("./db/supported-topics-db");
const embeddingVector = require('./db/embedding-vector');

const modelProviderOpenAI = require("./modelProviderOpenAI");
const { getArgumentation } = require("./utils/argumentation");

//Returns a parsed prompt, based on the product params
exports.chat = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const max_tokens = 100;
    let text = req.query.text;
    let historyTalk = req.query.historyTalk;
    console.log(getArgumentation(historyTalk))
    text = `${getArgumentation(historyTalk, max_tokens)}, agora responda essa pergunta ou afirmação baseada no contexto acima: \"${text}\"`;
    const response = await modelProviderOpenAI.textCompletionsDavinciSdk(text, {temperature: 0.1});
    const nTokens = await modelProviderOpenAI.countTokens(text);

    historyTalk = `${historyTalk || ''}\nuser: ${req.query.text} openai:${response.data.choices[0].text}`
    res.json({ result: response.data.choices[0].text, nTokens, historyTalk });
  })
});

/**
* @deprecated
*/
exports.chat2 = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    const context = {
      clientUUID : "9823dfd-2323-2323-2323-2323232323",
      offering: {
        offeringID : "offering_noroeste",
        domainType : "realestate",
        entities: [
          'products',
          'contato',
          'construtoras',
          'products_extra'
        ]
      }
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
    const listOfProducts = await products.getProductsUsingEmbedding(context, input); //TODO NEED TO CHAGE THIS. ONE Offering each time
    const addOns = await addons.getAddons("offering_noroeste");
    const supportedTopics = await supported_topics.getSupportedTopics("offering_noroeste");

    const formattedCorpus = await composedPrompt.format({
      supported_topics: supportedTopics,
      limits_generic: limitsGeneric,
      introduction: "",
      list_of_products: listOfProducts,
      addons: addOns,
      limits_around_topics: "",
    });

    console.log(formattedCorpus);

    //Call LLM service
    const response = await modelProviderOpenAI.textChatGPT35Sdk(formattedCorpus, {temperature: 0.1});

    //Send back the response
    res.json({ result: response.data.choices[0].text });
    
    }) //end of cors
  }); //end of exports.chat2


  exports.chat3 = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {

      //retrieve input from the request
      const input = req.body.input;

      const context = {
        clientUUID : "9823dfd-2323-2323-2323-2323232323",
        offering :
        {
          offeringID : "offering_noroeste",
          domainType : "realestate",
          lang: "pt_br",
          uxID: "TRY_BUY",
          entities: [
            'products',
            'contato',
            'construtoras',
            'products_extra',
          ]
        }
      };

      const chat = new ChatOpenAI({ temperature: 0.3 });

      const introductions = await introduction.getIntroduction(context.offering.domainType, context.offering.lang, context.offering.uxID);
      const limitsGeneric = await limits.getLimits("realestate", "pt_br");
      
      const contentFromEmbeddings = [];
      for await (const entity of context.offering.entities) {
        const result = await embeddingVector.queryEmbeddings(context, entity, input);
        contentFromEmbeddings.push(result[0].item.metadata.text);
      }

      const addOns = await addons.getAddons(context.offering.offeringID); 
      const supportedTopics = await supported_topics.getSupportedTopics(context.offering.offeringID);

      const mainPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          "{introduction} {supported_topics} {limits_generic} {list_of_products} {addons} {limits_around_topics}"
        ),
        HumanMessagePromptTemplate.fromTemplate("{text}"),
      ]);

      const responseA = await chat.generatePrompt([
        await mainPrompt.formatPromptValue({
          introduction: introductions,
          supported_topics: supportedTopics,
          limits_generic: limitsGeneric,
          list_of_products: contentFromEmbeddings,
          addons: addOns,
          limits_around_topics: "",
          text: input
        }),
      ]);

      //Send back the response
      res.json({ result: responseA });

    }) //end of cors
  }); //end of exports.chat3