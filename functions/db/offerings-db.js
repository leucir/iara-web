/* write a firebase CRUD module using the ../data/offerings.json to determine the document schema. use ./products-db.js as an example */
const admin = require('firebase-admin');
const db = admin.firestore();

const offeringDB = db.collection('offerings');

const getOfferings = async () => {
    const snapshot = await offeringDB.get();
    const offerings = [];
    snapshot.forEach((doc) => {
        offerings.push({ id: doc.id, ...doc.data() });
    });
    return offerings;
};  

const getOffering = async (id) => {
    const offeringDoc = offeringDB.doc(id);
    const snapshot = await offeringDoc.get();
    return snapshot.data();
}

const createOffering = async (offeringID, offering) => {

    const today = new Date();
    offering.createdAt = new Date(today.toUTCString());
    offering.expiresAt = new Date(today.setDate(today.getDate() + 30));       //expires in 30 days

    const snapshot = await offeringDB
    .doc(offeringID)
    .set(offering);

    //return a promise
    return snapshot;
}

const updateOffering = async (id, offering) => {
    await offeringDB.doc(id).update(offering);
}



const deleteOffering = async (id) => {
    await offeringDB.doc(id).delete();
}


module.exports = {
    getOfferings,
    getOffering,
    createOffering,
    updateOffering,
    deleteOffering,
}