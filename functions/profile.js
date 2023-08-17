require("dotenv").config();
const uuid = require('uuid');
const functions = require("firebase-functions");
const cors = require('cors')({origin: true});

const invitesDB = require('./db/invitations-db');
const offeringsDB = require('./db/offerings-db');

exports.get = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    const invitationId = req.query.inv;

    if(!invitationId){
      res.status(400).send('Missing invitationId');
      return;
    }

    //retrieve the invitation from the DB
    const invitation = await invitesDB.getInvitation(invitationId);

    //Check if invitation is undefined / not found
    if(invitation === undefined){
      res.status(400).send('Invalid invitation');
      return;
    }

    //retrieve the offering details given the invitation
    const offering = await offeringsDB.getOffering(invitation.offeringID);

    //Check if offering is undefined / not found
    if(offering === undefined){
      res.status(400).send('Cannot find an offering for this invitation');
      return;
    }

    //return the profile
    const profile = {
      logo : offering.content.logo,
      title : offering.content.title,
      welcomeMessage : invitation.message,
      inviter : invitation.invitee,
      inviteeFirstName: invitation.inviteeFirstName,
      inviteeLastName: invitation.inviteeLastName
    }

    res.status(200).send(profile);

    res.end();
  });
});


exports.session = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

        //Create an unique session ID
        const sessionID = uuid.v4();

        //return the session info
        const sessionInfo = {
          sessionID: sessionID
        }

        res.status(200).send(sessionInfo);

        res.end();
  });
});