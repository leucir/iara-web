const format = require("string-template");

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


exports.populate = async () => {

    'use strict';

    const fs = require('fs');
    
    let productsdata = fs.readFileSync('./data/products_1.json');
    let jsonProducts = JSON.parse(productsdata);

    let contextData = fs.readFileSync('./data/contexts_1.json');
    let jsonContext = JSON.parse(contextData);

    for(var itemProd in jsonProducts.products){
        var prod = jsonProducts.products[itemProd];

        var result= "";
        for(var itemContext in jsonContext.contexts){
            var context = jsonContext.contexts[itemContext];

            var corpusWithParams = format(context.corpus, prod);

            var cxtObjects = {
                data: {
                    short: context.short,
                    lang: context.lang,
                    corpus: corpusWithParams
                }
            };

            this.putContext(prod.id, cxtObjects);
        }
    }
}