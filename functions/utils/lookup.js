const invitationsDB = require("../db/invitations-db");


exports.getOfferingByInvitation = async function(invitationId) {
    
    //retrieve the invitation from the DB
    invitations = await invitationsDB.getInvitations();


    const invitation = invites.filter((entry) => entry.invitationID === invitationId);

    if(invitation.length === 0){
        throw new Error('Invalid invitation');
    }

    //retrieve the offering details given the invitation
    const offering = offerings.filter((entry) => entry.clientUUID === invitation[0].clientUUID);

    if(offering.length === 0){
        throw new Error('Cannot find an offering for this invitation');
    }

    return offering[0];
}