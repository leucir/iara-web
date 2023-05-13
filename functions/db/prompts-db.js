const format = require("string-template");
const admin = require('firebase-admin');
const db = admin.firestore();
const promptsDb = db.collection('prompts');

class Prompt {
    constructor(id, type, lang, corpus) {
        this.id = id;
        this.short = short;
        this.lang = 'pt_br';
        this.corpus = corpus;
    }
}

exports.putPrompt = async (id, params) => {
    const writeResult = await promptsDb.doc(id).set({
        short: params.data.short,
        lang: params.data.lang,
        corpus: params.data.corpus
    });
    return writeResult;
}

exports.getPrompt = async (id) => {
    const promptRef = promptsDb.doc(id);
    const doc = await promptRef.get();
    if (!doc.exists) {
        console.error('no prompt document found');
        return null;
    } else {
        return doc.data();
    }
}

exports.loadPrompts = async (scope) => {
    const promptRef = promptsDb;
    const prompts = await promptRef
    .where('lang', '==', scope.lang)
    .where('short', '==', scope.short)
    .get();

    if(!prompts.exists){
        console.error('no prompts found using the parameters. not able to load the list.');
        return null;
    }else{
        return prompts.data();
    }
}


exports.parsePrompt = (original, params) => {
    //TODO check params if not null
    return format(original, params);
}


exports.populate = async () => {
    'use strict';

    const fs = require('fs');

    let promptsdata = fs.readFileSync('./data/prompts_1.json');
    let jsonPrompts = JSON.parse(promptsdata);

    for (var itemPrompt in jsonPrompts.prompts) {
        var prompt = jsonPrompts.prompts[itemPrompt];

        console.log(prompt);

        var cxtObjects = {
            data: {
                short: prompt.short,
                lang: prompt.lang,
                corpus: prompt.corpus
            }
        };

        this.putPrompt(prompt.id, cxtObjects);
    }
}