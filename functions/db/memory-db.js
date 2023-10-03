const uuid = require('uuid');
const admin = require('firebase-admin');
const db = admin.firestore();
const memoryDb = db.collection('short_memory');

class Memory {

    /*
    @param id: the id of the memory
    @param flowType: the flow type of the message (IN:1/OUT:2)
    @param offeringID: the offering id

    */

    constructor(sessionID, flowType, offeringID, message){
        this.sessionID = sessionID;
        this.flowType = flowType;
        this.offeringID = offeringID;
        this.message = message;
        this.timestamp = new Date();
    }
}

exports.putMemory= async (sessionID, params) => {

    const docID = uuid.v4();

    const writeResult = await memoryDb.doc(docID).set({
        sessionID: sessionID,
        flowType: params.flowType,
        offeringID: params.offeringID,
        message: params.message,
        timestamp: new Date()
    });
    return writeResult;
}

exports.getMemory = async (id) => {
    const memoryRef = memoryDb.doc(id);
    const doc = await memoryRef.get();
    if(!doc.exists){
        console.error('no memory document found');
        return null;
    }else{
        return doc.data();
    }
}


exports.loadLastNMemories = async (sessionID, sizeMemory=5) => {
    const promptRef = await memoryDb
    .where("sessionID", "==", sessionID)
    .orderBy("timestamp", "desc")
    .limit(parseInt(sizeMemory))
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

    return formatMemoriesAsChat(memories);
}


//function to format a list of memories as a chat message, using flowtype to identify the user and the ai
formatMemoriesAsChat = (memories) => {
    var chat = [];
    memories.forEach(memory => {
        if (memory.flowType == 1) {
            //user
            chat.push("User:" + memory.message);
        }else{
            //ai
            chat.push("Assistant:" + memory.message);
        }
    });

    return chat;
}


