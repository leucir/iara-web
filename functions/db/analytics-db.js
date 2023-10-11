const firestore = require('firebase/firestore');
const uuid = require('uuid');
const admin = require('firebase-admin');
const db = admin.firestore();
const memoryDb = db.collection('short_memory');
const analyticsDb = db.collection('analytics');
const sessionDb = db.collection('uniqueSessions');


/*

This class will take care of the analytics of the chatbot.
It is going to be used to read the conversations, and prepare reports based on the supported queries.
Main features:
- read the conversation based on the sessionID
- read the conversation based on the offeringID, in a specific time range
- store the engagement insights, calculated in another class, to the database

*/

class Analytics {

    constructor(sessionID, offeringID, message){
        this.sessionID = sessionID;
        this.offeringID = offeringID;
        this.message = message;
        this.timestamp = new Date();
    }
    

    //this function will read the conversation based on the sessionID
    //it will return the conversation as a list of messages
    async readConversation(sessionID){
        const promptRef = await memoryDb
        .where("sessionID", "==", sessionID)
        .orderBy("timestamp", "desc")
        .get();

        const allDocs = promptRef.docs.map(doc => doc.data());

        //parse the memories, and extract the message
        var memories = [];
        allDocs.forEach(memory => {
            //append the message to the array
            const entry = {
                sessionID: memory.sessionID,
                flowType: memory.flowType,
                message: memory.message
            }
            memories.push(entry);
        });

        return memories;
    }


    //Retrieve the list of unique sessions given a time range
    async getUniqueSessionsList(startDate, endDate){

        const startUTCDate = new Date(startDate);
        const endUTCDate = new Date(endDate);

        const promptRef = await sessionDb
        .where("timestamp", ">=", startUTCDate.getTime())
        .where("timestamp", "<", endUTCDate.getTime()) 
        .orderBy("timestamp", "desc")
        .get();

        const allDocs = promptRef.docs.map(doc => doc.data());

        var uniqueSessions = [];
        allDocs.forEach(session => {
            //append the message to the array
            const entry = {
                sessionID: session.sessionID,
                timestamp: new Date(session.timestamp).toUTCString()
            }
            uniqueSessions.push(entry);
        });

        return uniqueSessions;
    }


    //this function will read the conversation based on the offeringID, in a specific time range
    //it will return the conversation as a list of messages
    async readConversationByOffering(offeringID, startDate, endDate){

        const startUTCDate = new Date(startDate);
        const endUTCDate = new Date(endDate);

        //Retrieve the memories from the database
        //startUTCDate and endUTCDate are the start and end dates in Epoch format
        const promptRef = await memoryDb
        .where("offeringID", "==", offeringID)
        .where("timestamp", ">=", startUTCDate.getTime())
        .where("timestamp", "<", endUTCDate.getTime()) 
        .orderBy("timestamp", "desc")
        .get();

        const allDocs = promptRef.docs.map(doc => doc.data());

        //parse the memories, and extract the message
        var memories = [];
        allDocs.forEach(memory => {
            //append the message to the array
            const entry = {
                sessionID: memory.sessionID,
                flowType: memory.flowType,
                message: memory.message,
                timestamp: new Date(memory.timestamp).toUTCString()
            }
            memories.push(entry);
        });

        return memories;
    }


    //function that will retrieve one conversation, given the sessionID
    async getConversationBySession(sessionID){

        //retrieve the memories from the database
        //startUTCDate and endUTCDate are the start and end dates in Epoch format
        const memoryRef = await memoryDb
        .where("sessionID", "==", sessionID)
        .orderBy("timestamp", "asc")
        .get();

        const allDocs = memoryRef.docs.map(doc => doc.data());

        //parse the memories, and extract the message
        var conversation =
            {
                sessionID: sessionID
            };

        var chats = [];
        allDocs.forEach(chat => {
            
            const flowType = chat.flowType==1 ? "User" : "Iara";

            //append the message to the array
            const entry = {
                message: flowType + " -> " + chat.message,
                timestamp: chat.timestamp
            }
            chats.push(entry);
        });

        conversation.chat = chats;

        return conversation;
    }

    //this function will store the engagement insights, calculated in another class, to the database
    async storeEngagementInsights(insights){
        //store the insights in the database
        const writeResult = await analyticsDb.doc().set({
            sessionID: insights.sessionID,
            offeringID: insights.offeringID,
            insights: insights.content,
            timestampCreation: new Date()
        });
        return writeResult;
    }
    
}

//export the class
module.exports = Analytics;

// Path: functions/db/analytics-db.js