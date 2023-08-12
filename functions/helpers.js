const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});

require("dotenv").config();

const completions = require("./modelProviderOpenAI");
const edits = require("./edits");
const productsDB = require("./db/products-db");
const promptsDB = require("./db/prompts-db");
const contextDB = require("./db/contexts-db");

//Add a product and its params
exports.populateData = functions.https.onRequest(async (req, res) => {
  contextDB.populate();
  promptsDB.populate();
  res.json({ result: `Contexts and Prompts are populated` });
});

//Returns a parsed prompt, based on the product params
exports.getPrompt = functions.https.onRequest(async (req, res) => {
  //extract params from req
  const productId = req.query.productId;
  const promptId = req.query.promptId;

  // retrieve product info
  productRef = await productsDB.getProduct(productId);

  // retrieve prompt info
  promptRef = await promptsDB.getPrompt(promptId);

  // parse prompt using product info
  parsedPrompt = promptsDB.parsePrompt(promptRef.corpus, productRef.params);

  const invokeCompletions = await completions
    .textCompletionsDavinciSdk(parsedPrompt)
    .then((responseCompletions) => {
      res.json({ result: responseCompletions.data.choices[0].text });
    });

  res.end();
});


exports.complete = functions.https.onRequest(async (req, res) => {
  var scope_context = {
    city: "BRASILIA",
    country: "BR",
  };
  contexts = contextDB.loadContexts(scope_context);

  console.log(contexts);

  var scope_prompt = {
    lang: "PT_BR",
    short: "introduce",
  };
  prompts = promptsDB.loadPrompts(scope_prompt);

  res.end();
});
