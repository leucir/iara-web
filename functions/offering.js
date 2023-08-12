const uuid = require('uuid');
const functions = require("firebase-functions");
const offeringsDB = require('./db/offerings-db');


//Returns a parsed prompt, based on the product params
exports.getOffering = functions.https.onRequest(async (req, res) => {
    const offeringId = req.query.offering;

    // retrieve offeringId info
    const offeringRef = await offeringsDB.getOffering(offeringId);
    res.json({ result: offeringRef });
    res.end();
}
);

exports.getOfferings = functions.https.onRequest(async (req, res) => {
    // retrieve offering info
    offeringsRef = await offeringsDB.getOfferings();
    res.json({ result: offeringsRef });
    res.end();
}
);

exports.updateOffering = functions.https.onRequest(async (req, res) => {
    res.end();
});

exports.deleteOffering = functions.https.onRequest(async (req, res) => {
    res.end();
});

exports.addOffering = functions.https.onRequest(async (req, res) => {
    const body = req.body;

    //No need to create an offeringID. It is alredy provided by the client
    const offeringID = body.offering.offeringID;

    //TODO: validate offering

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await offeringsDB
    .createOffering(offeringID, body.offering)
    .then(docRef => {

        // Send back a message that we've successfully written the message
        res.json({ result: `${offeringID}`});
    });
});