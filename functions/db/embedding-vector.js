const { LocalIndex } = require('vectra');
const path = require('path');

const EMBEDDING_INDEX_FOLDER = './functions/embeddings';  //where the embeddings index will be stored

// create a async function to get a vector embedding from the vectra index
const readEmbeddings = async (sentence, indexName, numResponses=3) => {

    // Create local index
    const index = new LocalIndex(path.join(EMBEDDING_INDEX_FOLDER, indexName));

    // Initialize index if it doesn't exist
    if (!await index.isIndexCreated()) {
        await index.createIndex();
    }

    // Query the index
    const vector = await getVector(sentence);
    const results = await index.queryItems(vector, numResponses);
    return results;
};


const queryEmbeddings = async (pContext, pEntityName, pQuery, numResponses=3) => {
    console.log(`\x1b[32mRetrieving embeddings for ${pContext.offeringID} ${pContext.domainType}.\x1b[0m`);

    indexName = pContext.offeringID + '_' + pContext.domainType + '_' + pEntityName;
    const qResults = await readEmbeddings(pQuery, indexName, numResponses);

    return qResults;
};

exports.queryEmbeddings = queryEmbeddings;

//CODE BELOW IS FOR TESTING PURPOSES ONLY

const context = {
    clientUUID : "9823dfd-2323-2323-2323-2323232323",
    offeringID : "offering_noroeste",
    domainType : "realestate",
    entities: [
        'products',
        'contato',
        'construtoras',
        'products_extra'
    ]
};

//refreshEmbeddings(context);
queryEmbeddings(context, 'products', '3 quartos na quadra 102')
.then((x) => {
    console.log(x[0].item.metadata.text);
});

//write a function to generate a unique id of 12 characters, in lowercase, using the following characters: abcdefghijklmnopqrstuvwxyz0123456789
const generateId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        const index = Math.floor(Math.random() * chars.length);
        id += chars[index];
    }
    return id;
};