require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});

const productsDB = require("./db/products-db");
const popupQuestionsDB = require("./db/popup-items-db");

//Add a product and its params
exports.addProduct = functions.https.onRequest(async (req, res) => {
  const name = req.body.name;
  const params = req.body.params;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = productsDB.putProdut(name, params);
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.getPopupItems = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    const offeringID = req.query.offeringID;
    const resultSize = req.query.popUpsize;

    if(!offeringID){
      res.status(400).send('Missing offering Id');
      res.end();
    }

    const popupItems = await popupQuestionsDB.getPopupItems(offeringID, resultSize);

    if(!popupItems){
      res.status(400).send('Popup items not found');
      res.end();
    }

    res.json(popupItems);
  });
});
