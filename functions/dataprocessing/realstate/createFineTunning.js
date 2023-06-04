const format = require("string-template");

console.log("Current directory:", process.cwd()); 

exports.putContext= async (id, params) => {
    const writeResult = await contextsDb.doc(id).set({
        short: params.data.short,
        lang: params.data.lang,
        corpus: params.data.corpus,
        scope_country: "BR",
        scope_city: "BRASILIA",
        class:"real_estate"
    });
    return writeResult;
}

exports.getContext = async (id) => {
    const promptRef = contextsDb.doc(id);
    const doc = await contextsRef.get();
    if(!doc.exists){
        console.error('no context document found');
        return null;
    }else{
        return doc.data();
    }
}

// TODO need to add more filters on this query. "short", "lang", "class", "etc"
exports.loadContexts = async (scope) => {

    const promptRef = contextsDb
    .where("scope_city", "==", "BRASILIA")
    .where("scope_country", "==", "BR")
    .get()
    .then(results => {
        results.forEach(doc => {
            console.log(doc.data());
        })
    });
}

exports.parseContext = (original, params) => {
    //TODO check params if not null
    return format(original, params);
}


createFineTunningFile = async () => {

    'use strict';

    const fs = require('fs');
    
    //retrieve products
    let productsdata = fs.readFileSync('./functions/data/products_1.json');
    let jsonProducts = JSON.parse(productsdata);

    //retrieve contexts from template
    let contextData = fs.readFileSync('./functions/data/finetunning/realestate/fine_tune_davinci_1_realstate_template.jsonl');

    //loop through products
    for(var itemProd in jsonProducts.products){
        var prod = jsonProducts.products[itemProd];

        console.log(prod);

        var corpusWithParams = format(contextData.toString(), prod);

        //append the context to a file called fine-tunning.jsonl
        fs.appendFileSync('./functions/data/finetunning/realestate/fine_tune_davinci_1_realstate_final.jsonl', corpusWithParams + "\n");
        }
}


createFineTunningFile();