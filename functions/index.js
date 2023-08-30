require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const cors = require('cors')({origin: true});

const firebaseConfig = {
  apiKey: "AIzaSyCAZ2dB7TVLI86oQJimFsX5dX_Qh-MpQy4",
  authDomain: "iara-api-15d42.firebaseapp.com",
  projectId: "iara-api-15d42",
  storageBucket: "iara-api-15d42.appspot.com",
  messagingSenderId: "900519176588",
  appId: "1:900519176588:web:65240962ad1bf888720ea9",
  measurementId: "G-QNT2K6BJCN"
};

// Initialize Firebase
const app = admin.initializeApp(firebaseConfig);
//const analytics = admin.getAnalytics(app);

const completions = require("./modelProviderOpenAI");
const edits = require("./edits");

const invitations = require("./invitations");
exports.invitations = invitations;

const chat = require("./chat");
exports.chat = chat;

const products = require("./products");
exports.products = products;

const helpers = require("./helpers");
exports.helpers = helpers;

const chain = require("./chain");
exports.chain = chain;

const operationsEmbeddings = require("./embeddings_route");
exports.operationsEmbeddings = operationsEmbeddings;

const profile = require("./profile");
exports.profile = profile;

const offering = require("./offering");
exports.offering = offering;

const memory = require("./memory");
exports.memory = memory;