const functions = require("firebase-functions");
const embeddingVector = require('./db/embedding-vector');


exports.refreshEmbeddings = functions.https.onRequest(async (req, res) => {

    const context = req.body;

    await embeddingVector.refreshEmbeddings(context.offeringID, context.domainType);

    // Send back a message that we've successfully written the message
    res.json({writeResult: "Embeddings refreshed successfully!"});
});
