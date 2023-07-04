const uxFromDB = [{
    "lang": "pt_br",
    "uxID": "TRY_BUY",
    "uxPrompt": "Integre de forma fluida a essência de \"Descubra, Experimente e Compre\" nas interações do seu assistente de IA. Incentive os clientes a explorar opções diversas, encoraje-os a experimentar novas experiências e forneça recomendações personalizadas que capacitem uma tomada de decisão informada. Permita que o assistente de IA encarne a jornada de descoberta, experimentação e realização ao longo da conversa."
    },
    {
    "lang": "en_us",
    "uxID": "TRY_BUY",
    "uxPrompt": "Seamlessly integrate the essence of \"Discover, Try and Buy\" in your AI assistant interactions. Encourage customers to explore diverse options, encourage them to try new experiences and provide personalized recommendations that empower informed decision making. Allow the AI assistant to embody the journey of discovery, experimentation and fulfillment throughout the conversation."
}];


const introductionsFromDB = [{
    "type": "realestate",
    "lang": "pt_br",
    "uxID": "TRY_BUY",
    "introduction" :"Você é um assistente especialista em vender."
}];

exports.getIntroduction = async function(type, lang, uxID) {

    //TODO: this code will query from the DB in the future

    //iterate over the list of limits and join the ones that match the type and lang. return the joined string
    const introductionMap = introductionsFromDB.filter((entry) => entry.type === type && entry.lang === lang && entry.uxID === uxID); 

    const UxMap = uxFromDB.filter((entry) => entry.lang === lang && entry.uxID === uxID); 

    //get the introduction from the map and combine it with the UX prompt
    const introductionString = introductionMap.map((entry) => entry.introduction).join("\n") + "\n" + UxMap.map((entry) => entry.uxPrompt).join("\n");

    //return limitString if it is not empty, otherwise return a generic limit, inline
    return introductionString;
}