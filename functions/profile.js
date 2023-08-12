require("dotenv").config();
const functions = require("firebase-functions");
const cors = require('cors')({origin: true});

const invitesDB = require('./db/invitations-db');
const offeringsDB = require('./db/offerings-db');

//TODO: load from offerings DB service
/*
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
*/


/*

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

  */


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
  })
});