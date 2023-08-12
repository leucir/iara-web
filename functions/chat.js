require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const {PromptTemplate, PipelinePromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} = require("langchain/prompts");
const {ChatOpenAI} = require("langchain/chat_models/openai");
const {HumanChatMessage, AIChatMessage, SystemChatMessage} = require("langchain/schema");
const {BufferMemory} = require("langchain/memory");
const {DynamoDBChatMessageHistory} = require("langchain/stores/message/dynamodb");
const {ConversationChain} = require("langchain/chains");

const introduction = require("./db/introduction-db");
const limits = require("./db/limits-db");
const addons = require("./db/addons-db");
const supported_topics = require("./db/supported-topics-db");
const embeddingVector = require('./db/embedding-vector');
const offeringsDB = require("./db/offerings-db");
const invitationsDB = require("./db/invitations-db");


  /**
   * @current
   */
  exports.v4 = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {

      //retrieve input from the request
      const input = req.query.input;
      const invitationID = req.query.inv;
      const offeringID = req.query.offering;

      //Build the context given the invitationID and the offeringID
      const invitation = await invitationsDB.getInvitation(invitationID);

      var offering = {};
      if(invitation){
        console.log("Chat::Retrieving offering from invitation");
        offering = await offeringsDB.getOffering(invitation.offeringID);
      }else{
        console.log("Chat::Retrieving offering from offeringID");
        offering = await offeringsDB.getOffering(offeringID);
      }

      //log the timestamp
      console.log("Timestamp <Before Buffer Memory>: " + new Date().toISOString());

      //get the current daty of the year
      const currentDayOfYear = new Date().getDate();
      console.log("Current Day of Year: " + currentDayOfYear);

      const memory = new BufferMemory({
        chatHistory: new DynamoDBChatMessageHistory({
          tableName: offering.offeringID,
          partitionKey: "id",
          sessionId: invitationID + currentDayOfYear, // Or some other unique identifier for the conversation
          config: {
            region: "us-east-1",
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
          },
        }),
      });
      console.log("Timestamp <After Buffer Memory>: " + new Date().toISOString());

      const chat = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.5, maxTokens: 250});

      console.log("Timestamp <Before get Introduction>: " + new Date().toISOString());
      const introductions = await introduction.getIntroduction(offering.domainType, offering.lang, offering.uxID);
      console.log("Timestamp <After get Introduction>: " + new Date().toISOString());

      console.log("Timestamp <Before get Limits>: " + new Date().toISOString());
      const limitsGeneric = await limits.getLimits("realestate", "pt_br");
      console.log("Timestamp <After get Limits>: " + new Date().toISOString());
      
      console.log("Timestamp <Before get Embeddings>: " + new Date().toISOString());
      const contentFromEmbeddings = [];
      for await (const entity of offering.entities) {
        const result = await embeddingVector.queryEmbeddings(offering.offeringID, offering.domainType, entity, input);
        contentFromEmbeddings.push(result[0].item.metadata.text);
      }
      console.log("Timestamp <After get Embeddings>: " + new Date().toISOString());

      const addOns = await addons.getAddons(offering.offeringID); 
      const supportedTopics = await supported_topics.getSupportedTopics(offering.offeringID);

      const systemContext = introductions + " " + supportedTopics + " " + limitsGeneric + " " + contentFromEmbeddings + " " + addOns;
      const fullInput = systemContext + " " + input;

      const chain = new ConversationChain({
        llm: chat,
        memory: memory
      });
  
      console.log("Timestamp <Before call Chain>: " + new Date().toISOString());

      try {
        const responseChat = await chain.call({
          input: fullInput,
        });
        console.log("Timestamp <After call Chain>: " + new Date().toISOString());
  
        //TODO check if the response is valid, otherwise return an standard answer
  
        //Send back the response
        res.json({ result: responseChat.response });          
      } catch (error) {
        console.log(error);
        res.end();
      }

    }) //end of cors
  }); //end of exports.v4