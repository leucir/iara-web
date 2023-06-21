/*
    This is script is only to query embeddings.
    There is another script to generate the embeddings.
    It is located at functions/dataprocessing/realstate/embeddings.js
*/

const functions = require("firebase-functions");
const utilEmbeddings = require('../utils/embeddings');
const { LocalIndex } = require('vectra');
const path = require('path');
const fs = require('fs').promises;
const {encode, decode} = require('gpt-3-encoder');
const { create } = require("domain");

const EMBEDDING_INDEX_FOLDER = '/embeddings';  //where the embeddings index will be stored
const EMBEDDING_SEPARATOR = '//****//';
const EMBEDDING_DATA_FOLDER = '/data/embeddings';  //where the embeddings data will be stored

// create a async function to get a vector embedding from the vectra index
const readEmbeddings = async (sentence, indexName, numResponses=3) => {

    // Create local index
    const index = new LocalIndex(path.join(__dirname, '..', EMBEDDING_INDEX_FOLDER, indexName));

    console.log(`\x1b[32mQuerying index from folder \x1b[0m` + path.join(__dirname, '..', EMBEDDING_INDEX_FOLDER, indexName));

    // Initialize index if it doesn't exist
    if (!await index.isIndexCreated()) {
        console.log(`\x1b[32mIndex not found. Creating index.\x1b[0m`);
        await index.createIndex();
    }

    // Query the index
    const vector = await utilEmbeddings.getVector(sentence);
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


//Create an async function to write embeddings to the vectra index
const writeEmbeddings = async (text, indexName) => {

    // Create local index
    const index = new LocalIndex(path.join(__dirname,'..', EMBEDDING_INDEX_FOLDER, indexName));

    // Initialize index if it doesn't exist
    if (!await index.isIndexCreated()) {
        await index.createIndex();
    }

    const vector = await utilEmbeddings.getVector(text);

    // Add the text to the index
    await index.insertItem({
        vector,
        metadata: { text }
    });

};


//create a function to read all files from a directory, and write them to the vectra index using the writeEmbeddings function
const createEmbeddings = async (fullPath, indexNamePrefix) => {
    console.log(`\x1b[32mCreating embeddings for ${fullPath}.\x1b[0m`);

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
    console.log(`\x1b[32mRefreshing embeddings for ${pContext.offeringID} ${pContext.domainType}.\x1b[0m`);

    dataFullPath = getEmbeddingsDataFullPath(pContext);

    indexNamePrefix = pContext.offeringID + '_' + pContext.domainType;
    createEmbeddings(dataFullPath, indexNamePrefix);
};

//Util function to remove the extension of a filename
const removeExtension = (filename) => {
    console.log(`\x1b[32mRemoving extension from ${filename}.\x1b[0m`);
    return filename.split('.').slice(0, -1).join('.');
};

//Util function to get the full path of the embeddings
const getEmbeddingsDataFullPath = (pContext) => {
    console.log(`\x1b[32mGetting embeddings data full path for ${pContext.offeringID} ${pContext.domainType}.\x1b[0m`);
    return path.join(__dirname,'..',EMBEDDING_DATA_FOLDER, pContext.offeringID, pContext.domainType);
};


exports.refreshEmbeddings = refreshEmbeddings;