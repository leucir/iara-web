const popupQuestionsFromDB = [
    {
        "offeringId": "offering_noroeste",
        "title": "Perguntas frequentes",
        "items" : [
            "Qual o valor do condomínio?",
            "Alguma unidade tem vista para o parque?",
            "Quais são as opções de lazer?",
            "Quais os tamanhos das unidades?",
            "Qual imóvel é recomendado para uma família de 4 pessoas?",
            "Quais as opções de transporte público?",
            "Alguma sugestão para um apartmento de 2 quartos?"
        ]
    }
];

exports.getPopupItems = async function(offeringId, resultSize = 3) {

    //TODO: this code will query from the DB in the future

    console.log('Sending popup items to the offering :' + offeringId)
    //iterate over the list of limits and join the ones that match the type and lang. return the joined string
    const popupQMap = popupQuestionsFromDB.filter((pPopupQ) => pPopupQ.offeringId === offeringId); 

    if(popupQMap.length === 0){
        console.log('No popup items found for the offering :' + offeringId)
        return;
    }

    //Ransomly select the questions, limited by the resultSize
    const selectedItems = popupQMap[0].items.sort(() => .5 - Math.random()).slice(0, resultSize);

    const result = {
        title: popupQMap[0].title,
        items: selectedItems
    }

    return result;
}