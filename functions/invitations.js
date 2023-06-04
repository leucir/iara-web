const uuid = require('uuid');
const functions = require("firebase-functions");
const invitationsDB = require('./db/invitations-db');
const mailDB = require('./db/mail-db');


//Returns a parsed prompt, based on the product params
exports.getInvitation = functions.https.onRequest(async (req, res) => {
    const invitationId = req.query.invitationId;
    console.log(invitationId);

    // retrieve product info
    const invitationRef = await invitationsDB.getInvitation(invitationId);
    res.json({ result: invitationRef });
    res.end();
}
);

exports.getInvitations = functions.https.onRequest(async (req, res) => {
    // retrieve product info
    invitationsRef = await invitationsDB.getInvitations();
    res.json({ result: invitationsRef });
    res.end();
}
);

exports.updateInvitation = functions.https.onRequest(async (req, res) => {
    res.end();
});

exports.deleteInvitation = functions.https.onRequest(async (req, res) => {
    res.end();
});

exports.addInvitation = functions.https.onRequest(async (req, res) => {
    const invitation = req.body;

    //create a code to create a random GUID
    const invitationID = uuid.v4();

    //TODO: validate invitation

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await invitationsDB
    .createInvitation(invitationID, invitation)
    .then(docRef => {

        //Persist mail in the mail collections
        const mailResult = mailDB.sendMail(
            invitation.invitee,
            'Welcome to the Noroeste Digital',
            'This is an <code>HTML</code> email body.'
        );

        // Send back a message that we've successfully written the message
        res.json({ result: `https://www.conhecaonoroeste.com.br/invite=${invitationID}`});
    });
});