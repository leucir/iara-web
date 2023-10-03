require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const {SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} = require("langchain/prompts");
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
const memoryDB = require("./db/memory-db");
const offeringContent = require("./storage/offeringContent");

const logs = require("./utils/logs");


  /**
   * @current
   */
  exports.v4 = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {

      //retrieve input from the request
      const input = req.query.input;
      const invitationID = req.query.inv;
      const offeringID = req.query.offeringID;
      const sessionID = req.query.sessionID;

      if(sessionID === undefined){
        res.status(400).send('Missing sessionID. Call /profile-session first');
        res.end();
        return;
      }

      if(!offeringID){
        console.log("Chat::Offering not found");
        res.status(400).send("Offering not found");
        res.end();
        return;
      }

      var invitation = undefined;
      if(invitationID){
        //Build the context given the invitationID and the offeringID
        invitation = await invitationsDB.getInvitation(invitationID);
      }

      var offering = undefined;
      console.log("Chat::Retrieving offering from offeringID");
      offering = await offeringsDB.getOffering(offeringID);

      logs.recordPass('chat','v4','Before Buffer Memory');

      //Memorize the Chat (not the user) for future calls
      /*
      const memory = new BufferMemory({
        chatHistory: new DynamoDBChatMessageHistory({
          tableName: offering.offeringID,
          partitionKey: "id",
          sessionId: sessionID, // Or some other unique identifier for the conversation
          config: {
            region: "us-east-1",
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
          },
        }),
      });
      */
      logs.recordPass('chat','v4','After Buffer Memory');

      logs.recordPass('chat','v4','Before Get Introduction');
      const introductions = await introduction.getIntroduction(offering.domainType, offering.lang, offering.uxID);
      logs.recordPass('chat','v4','After Get Introduction');

      logs.recordPass('chat','v4','Before Get Limits');
      const limitsGeneric = await limits.getLimits("realestate", "pt_br");
      logs.recordPass('chat','v4','After Get Limits');
      
      logs.recordPass('chat','v4','Before Get Embeddings');
      const contentFromEmbeddings = [];
      const uniqueIdsFromEmbeddings = [];
      for await (const entity of offering.entities) {
        const fullResult = await embeddingVector.queryEmbeddings(offering.offeringID, offering.domainType, entity, input);
        //iterate over result and select only the occurrences that are above the threshold defined in entry.score
        const result = fullResult.filter((entry) => entry.score > process.env.EMBEDDING_THRESHOLD);
        //iterate over result and push the text to the contentFromEmbeddings array
        finalResult = result.map((entry) => {
          contentFromEmbeddings.push(entry.item.metadata.text);

          //push new uniqueId to the array if uniqueId is different of "NOT_FOUND"
          if(entry.item.metadata.uniqueId != "NOT_FOUND"){
            uniqueIdsFromEmbeddings.push(entry.item.metadata.uniqueId);
          }
        })
      }
      logs.recordPass('chat','v4','After Get Embeddings');

      logs.recordPass('chat','v4','Before Get AddOns');
      const addOns = await addons.getAddons(offering.offeringID); 
      logs.recordPass('chat','v4','After Get AddOns');

      logs.recordPass('chat','v4','Before Get Supported Topics');
      const supportedTopics = await supported_topics.getSupportedTopics(offering.offeringID);
      logs.recordPass('chat','v4','After Get Supported Topics');

      logs.recordPass('chat','v4','Before Get Memories');
      const memories = await memoryDB.loadLastNMemories(sessionID, process.env.MEMORY_SIZE);
      logs.recordPass('chat','v4','After Get Memories');

      const systemContext = introductions
      + " " 
      + supportedTopics 
      + " " 
      + limitsGeneric 
      + " " 
      + "_embeddings_BEGIN_ " + contentFromEmbeddings + " _embeddings_END_"
      + " " 
      + addOns 
      + " "
      + "Assistente Virtual, use _memories_ para lembrar o que conversamos. Use _embeddings_ para enriquecer o conteudo."
      + "_memories_BEGIN " + memories + " _memories_END"
      + "{_placehoder_}";
      const fullInput = systemContext + " " + input;

      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(systemContext),
        HumanMessagePromptTemplate.fromTemplate(input),
      ]);

      const chat = new ChatOpenAI({ modelName: 'gpt-3.5-turbo-0613', temperature: 0.7, maxTokens: 500, functions:
      [
        {
          name: "getProductMedia",
          description: "O usuario quer comprar o imovel",
          parameters: {
            type: "object",
            properties: {
              productName: {
                type: "string",
                description: "o nome do imovel",
              },
            },
            required: ["productName"],
          }
        }
      ],
      function_call: 'auto'
      });

      const chain = new ConversationChain({
        prompt: chatPrompt,
        llm: chat,
        return_final_only: false
      });
  
      logs.recordPass('chat','v4','Before Call Chain');
      try {
        //store the input in the memoryDB
        await memoryDB.putMemory(sessionID, {
          flowType: 1,
          offeringID: offering.offeringID,
          message: input
        });

        //This _placeholder_ variable is to enable the ChatPromptTemplate that requires at least one parameter
        const responseChat = await chain.call({
          _placehoder_ : ""
        });

        //store the input in the memoryDB
        await memoryDB.putMemory(sessionID, {
          flowType: 0,
          offeringID: offering.offeringID,
          message: responseChat.response
        });

        logs.recordPass('chat','v4','After Call Chain');

        console.log("Chat::Response from OpenAI::"+JSON.stringify(responseChat));
  
        //TODO check if the response is valid, otherwise return an standard answer

        //Check if the response has a function call
        //console.log("function called::"+responseChat.data.choices[0].finish_reason);    
        
        //Use the results from the uniqueIdsFromEmbeddings to build a list of URLs and them an JSON object
        var urls = await offeringContent.getMediaURLsFromUniqueIds(uniqueIdsFromEmbeddings);

        //Send back the response
        res.json({ 
          result: responseChat.response,
          urls: urls 
        });

      } catch (error) {
        console.log(error);
        res.end();
      }

    }) //end of cors
  }); //end of exports.v4