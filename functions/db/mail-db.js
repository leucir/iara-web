const admin = require('firebase-admin');
const db = admin.firestore();

exports.sendMail = async (to, subject, html) => {
    const writeResult = await db.collection('mail').add({
        to: to,
        message: {
            subject: subject,
            html: html
        }
    });

    return writeResult;
}