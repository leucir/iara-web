const functions = require("firebase-functions");
const Analytics = require("./db/analytics-db");
const cors = require('cors')({origin: true});

/*
Using the /db/analytics-db.js, create a set of functions to expose the analytics class as an API.
*/

exports.getHistoryPerTimeRange = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {

        const offeringID = req.query.offeringID;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // retrieve offeringId info
        const analytics = new Analytics();
        const memories = await analytics.readConversationByOffering(offeringID, startDate, endDate);

        const memoriesFormatted = memories.map(memory => {
            return {
                sessionID: memory.sessionID,
                flowType: memory.flowType,
                message: memory.message,
                timestamp: convertTZ(memory.timestamp, "America/Chicago")
            }
        });

        res.json({ result: memoriesFormatted });
        res.end();
    
    })
});


exports.getUniqueSessionList = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {

        const offeringID = req.query.offeringID;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // retrieve offeringId info
        const analytics = new Analytics();
        const sessions = await analytics.getUniqueSessionsList(startDate, endDate);

        const sessionsFormatted = sessions.map(session => {
            return {
                sessionID: session.sessionID,
                timestamp: convertTZ(session.timestamp, "America/Chicago")
            }
        });

        res.json({ result: sessionsFormatted });
        res.end();
    
    })
});

//Function that will retrieve one conversation, given the sessionID
exports.getConversationBySession = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {

        const sessionID = req.query.sessionID;

        // retrieve offeringId info
        const analytics = new Analytics();
        const memories = await analytics.getConversationBySession(sessionID);

        //TODO format the timestampe
        // but first, decide if the profile will be created and send to the *-db modules

        res.json({ result: memories });
        res.end();
    
    })
});

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}



