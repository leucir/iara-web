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


//TODO: load from offerings DB service
const offerings = [{
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
    ],
    content: {
      logo : 'images/logo.png',
      title : 'some_title',
    }
  }
}];

const invites = [{
  invitationID : "123456",
  clientUUID : "9823dfd-2323-2323-2323-2323232323",
  invitee: "leucir@gmail.com",
  inviteePhone : "+15128176956",
  inviteeFirstName: "John",
  inviteeLastName: "Noarms",
  status: "pending",
  updated: "2015-01-01T00:00:00Z",
  message: "Hello, would you like to be my friend?",
  type: "realstate",
  createdAt: "2015-01-01T00:00:00Z",
  expiresAt: "2015-01-01T00:00:00Z"
  }];


exports.getPopupItems = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    const invitationId = req.query.inv;
    const resultSize = req.query.size;

    if(!invitationId){
      res.status(400).send('Missing invitation Id');
      return;
    }

    //retrieve the invitation from the DB
    const invitation = invites.filter((entry) => entry.invitationID === invitationId);

    if(invitation.length === 0){
      res.status(400).send('Invalid invitation');
      return;
    }

    //retrieve the offering details given the invitation
    const offering = offerings.filter((entry) => entry.clientUUID === invitation[0].clientUUID);

    if(offering.length === 0){
      res.status(400).send('Cannot find an offering for this invitation');
      return;
    }

    //retrieve the invitation from the DB
    const popupItems = await popupQuestionsDB.getPopupItems(offering[0].offering.offeringID, resultSize);

    res.json(popupItems);
  });
});
