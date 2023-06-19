require("dotenv").config();

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
const app = admin.initializeApp(firebaseConfig);
//const analytics = admin.getAnalytics(app);

const completions = require("./completions");
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