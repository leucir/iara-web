require("dotenv").config();
const functions = require("firebase-functions");
const cors = require('cors')({origin: true});

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


//Add a product and its params
exports.get = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    const invitationId = req.query.inv;

    if(!invitationId){
      res.status(400).send('Missing invitationId');
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

    console.log(offering[0].offering.content.logo);

    //return the profile
    const profile = {
      logo : offering[0].offering.content.logo,
      title : offering[0].offering.content.title,
      invitation : invitation[0].message,
      invitee : invitation[0].invitee,
      inviteeFirstName: invitation[0].inviteeFirstName,
      inviteeLastName: invitation[0].inviteeLastName
    }

    res.status(200).send(profile);

    res.end();
  })
});