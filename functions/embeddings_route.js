const functions = require("firebase-functions");
const embeddingVector = require('./db/embedding-vector');


exports.refreshEmbeddings = functions.https.onRequest(async (req, res) => {

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

    await embeddingVector.refreshEmbeddings(context);

    // Send back a message that we've successfully written the message
    res.json({writeResult: "ok"});
});
