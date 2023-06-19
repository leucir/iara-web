const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});

const firebaseConfig = {
  apiKey: "AIzaSyDnVsjjZUfaIc5R8E_vakT9mdWzU33GKtc",
  authDomain: "prop-tech-iara.firebaseapp.com",
  projectId: "prop-tech-iara",
  storageBucket: "prop-tech-iara.appspot.com",
  messagingSenderId: "407930697691",
  appId: "1:407930697691:web:cd3fbe488997a9a843d9fe",
  measurementId: "G-KGBHMDWS77",
};

// Initialize Firebase
//const app = admin.initializeApp(firebaseConfig);
//const analytics = admin.getAnalytics(app);

require("dotenv").config();

const completions = require("./completions");
const edits = require("./edits");

const invitations = require("./invitations");
exports.invitations = invitations;

const chat = require("./chat");
exports.chat = chat;

const products = require("./products");
exports.products = products;

const productsDB = require("./db/products-db");
const promptsDB = require("./db/prompts-db");
const contextDB = require("./db/contexts-db");
const { getArgumentation } = require("./utils/argumentation");

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
