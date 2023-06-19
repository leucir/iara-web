const addonsFromDB = [
    {
        "offeringId": "noroeste",
        "addon" :"Addon: Farmácia Pague Menos (61 3314-1000), a Farmácia Droga Raia (61 3314-1000)."
        },
    {
        "offeringId": "noroeste",
        "addon" :"Addon: Escola Estadual Profa. Leda Nakano, Colégio Estadual Carlos Drummond de Andrade, Escola Estadual Prof. Ernesto de Castro, Escola Estadual Prof. Amadeu Silva e Escola Estadual Prof. Francisco de Souza. Algumas escolas não foram incluidas nesta lista."
    },
    {
        "offeringId": "noroeste",
        "addon" :"Os bancos Bradesco e Itau são os preferenciais para financiamento. Não informar outros bancos."
    }
];

exports.getAddons = async function(offering) {

    //TODO: this code will query from the DB in the future

    //iterate over the list of limits and join the ones that match the type and lang. return the joined string
    const addonMap = addonsFromDB.filter((addon) => addon.offeringId === offering); 
    const addonString = addonMap.map((addon) => addon.addon).join("\n");
    
    return addonString;
}