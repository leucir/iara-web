const { Configuration, OpenAIApi } = require("openai");
const { LocalIndex } = require('vectra');
const path = require('path');
const fs = require('fs').promises;
const {encode, decode} = require('gpt-3-encoder');
const { create } = require("domain");

const EMBEDDING_SEPARATOR = '//****//';
const EMBEDDING_DATA_FOLDER = './functions/data/embeddings'; //where the text files are stored
const EMBEDDING_INDEX_FOLDER = './functions/embeddings';  //where the embeddings index will be stored

// Create OpenAI API client
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const api = new OpenAIApi(configuration);

async function getVector(text) {
    const response = await api.createEmbedding({
        'model': 'text-embedding-ada-002',
        'input': text,
    });
    return response.data.data[0].embedding;
}

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

//Create an async function to write embeddings to the vectra index
const writeEmbeddings = async (text, indexName) => {

    // Create local index
    const index = new LocalIndex(path.join(EMBEDDING_INDEX_FOLDER, indexName));

    // Initialize index if it doesn't exist
    if (!await index.isIndexCreated()) {
        await index.createIndex();
    }

    const vector = await getVector(text);

    // Add the text to the index
    await index.insertItem({
        vector,
        metadata: { text }
    });

};


//create a function to read all files from a directory, and write them to the vectra index using the writeEmbeddings function
const createEmbeddings = async (fullPath, indexNamePrefix) => {
    const files = await fs.readdir(fullPath);
    let totalTokens = 0;

    for (const file of files) {
        const text = await fs.readFile(path.join(fullPath, file), 'utf8');
        const indexName = indexNamePrefix + '_' + removeExtension(file);

        //write a code that will split the text into sentences using the EMBEDDING_SEPARATOR, and write each sentence to the vectra index
        const sentences = text.split(EMBEDDING_SEPARATOR);

        for (const sentence of sentences) {
            await writeEmbeddings(sentence, indexName);
        }

        const tokens = await countTokens(text);
        totalTokens += tokens;
        console.log(`\x1b[32m${file} has ${tokens} tokens.\x1b[0m`);
    }
    console.log(`\x1b[32mTotal tokens is ${totalTokens}.\x1b[0m`);

};

//TODO: try to make this function reusable
const countTokens = (async (text) => {
    const str = text;
    const encoded = encode(str)

    return encoded.length;
});

//Function to refresh the embeddings
const refreshEmbeddings = async (pContext) => {
    dataFullPath = getEmbeddingsDataFullPath(pContext);
    console.log(`\x1b[32mRefreshing embeddings for ${pContext.offeringID} ${pContext.domainType}.\x1b[0m`);

    indexNamePrefix = pContext.offeringID + '_' + pContext.domainType;
    createEmbeddings(dataFullPath, indexNamePrefix);
};

const queryEmbeddings = async (pContext, pEntityName, pQuery, numResponses=3) => {
    console.log(`\x1b[32mRetrieving embeddings for ${pContext.offeringID} ${pContext.domainType}.\x1b[0m`);

    indexName = pContext.offeringID + '_' + pContext.domainType + '_' + pEntityName;
    const qResults = await readEmbeddings(pQuery, indexName, numResponses);

    return qResults;
};

//Util function to remove the extension of a filename
const removeExtension = (filename) => {
    return filename.split('.').slice(0, -1).join('.');
};

//Util function to get the full path of the embeddings
const getEmbeddingsDataFullPath = (pContext) => {
    return path.join(EMBEDDING_DATA_FOLDER, pContext.offeringID, pContext.domainType);
};


exports.refreshEmbeddings = refreshEmbeddings;
exports.queryEmbeddings = queryEmbeddings;

//CODE BELOW IS FOR TESTING PURPOSES ONLY

const context = {
    clientUUID : "9823dfd-2323-2323-2323-2323232323",
    offeringID : "offering_sample",
    domainType : "realestate",
    entities: [
        'products',
        'contato',
        'construtoras',
        'products_extra'
    ]
};



//refreshEmbeddings(context);
queryEmbeddings(context, 'products', 'apartamento')
.then((x) => {
    console.log(x);
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