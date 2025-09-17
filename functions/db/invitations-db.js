/* write a firebase CRUD module using the ../data/invitations.json to determine the document schema. use ./products-db.js as an example */
const admin = require('firebase-admin');
const db = admin.firestore();

const invitationDB = db.collection('invitations');

const getInvitations = async () => {
    const snapshot = await invitationDB.get();
    const invitations = [];
    snapshot.forEach((doc) => {
        invitations.push({ id: doc.id, ...doc.data() });
    });
    return invitations;
    };  

const getInvitation = async (id) => {
    const invitationDoc = invitationDB.doc(id);
    const snapshot = await invitationDoc.get();
    return snapshot.data();
}

const getInvitationsByInvitee = async (invitee) => {
    const invitation = await invitationDB
    .where('invitee', '==', invitee)
    .get();

    return invitation.data();
}

const createInvitation = async (invitationID, invitation) => {

    const today = new Date();
    invitation.createdAt = new Date(today.toUTCString());
    invitation.expiresAt = new Date(today.setDate(today.getDate() + 30));       //expires in 30 days

    const snapshot = await invitationDB
    .doc(invitationID)
    .set(invitation);

    //return a promise
    return snapshot;
}

const updateInvitation = async (id, invitation) => {
    await invitationDB.doc(id).update(invitation);
}



const deleteInvitation = async (id) => {
    await invitationDB.doc(id).delete();
}


//Callback from the invitations collections
admin.firestore().collection('invitations').add({
    to: 'leucir@gmail.com',
    message: {
      subject: 'Hello from Firebase!',
      html: 'This is an <code>HTML</code> email body.',
    },
  });


module.exports = {
    getInvitations,
    getInvitation,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    getInvitationsByInvitee
}