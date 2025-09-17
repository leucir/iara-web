const uuid = require('uuid');
const functions = require("firebase-functions");
const memoryDB = require('./db/memory-db');

exports.get = functions.https.onRequest(async (req, res) => {
    const sessionID = req.query.sessionID;

    // retrieve offeringId info
    const memoryRef = await memoryDB.getMemory(sessionID);
    res.json({ result: memoryRef });
    res.end();
}
);

exports.getLast = functions.https.onRequest(async (req, res) => {
    const sessionID = req.query.sessionID;
    var sizeMemory = req.query.sizeMemory;

    if(sizeMemory){
        //transform to int
        sizeMemory = parseInt(sizeMemory);
    }

    // retrieve offeringId info
    const memoryRef = await memoryDB.loadLastNMemories(sessionID, sizeMemory);
    res.json({ result: memoryRef });
    res.end();
}
);


exports.delete = functions.https.onRequest(async (req, res) => {
    res.end();
});


exports.append = functions.https.onRequest(async (req, res) => {
    const memoryBody = req.body;

    const sessionID = memoryBody.sessionID;
    const params = {};

    params.flowType = memoryBody.flowType;
    params.offeringID = memoryBody.offeringID;
    params.message = memoryBody.message;

    //TODO: validate offering

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await memoryDB
    .putMemory(sessionID, params)
    .then(docRef => {
        // Send back a message that we've successfully written the message
        res.json({ result: `${sessionID}`});
    });
});