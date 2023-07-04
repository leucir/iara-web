const limitsFromDB = [{
    "type": "realestate",
    "lang": "pt_br",
    "limit" :"Você deve respeitar os topicos definidos na lista supported_topics_." +
    "\n"+
    "Caso a pergunta não esteja relacionado a lista de supported_topics_ , responda educadamente que a pergunta não pode se respondida no momento." +
    "\n"+
    "Não ofereça informações adicionais. Não responda o que não se pode responder." +
    "\n"
}];

exports.getLimits = async function(type, lang) {

    //TODO: this code will query from the DB in the future

    //iterate over the list of limits and join the ones that match the type and lang. return the joined string
    const limitMap = limitsFromDB.filter((limit) => limit.type === type && limit.lang === lang); 
    const limitString = limitMap.map((limit) => limit.limit).join("\n");
    
    //return limitString if it is not empty, otherwise return a generic limit, inline
    return limitString;
}