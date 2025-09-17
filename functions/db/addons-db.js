const addonsFromDB = [
    {
        "offeringId": "offering_noroeste",
        "addon" :"Addon: Farmácia Pague Menos (61 3314-1000), a Farmácia Droga Raia (61 3314-1000)."
        },
    {
        "offeringId": "offering_noroeste",
        "addon" :"Addon: Escola Estadual Profa. Leda Nakano, Colégio Estadual Carlos Drummond de Andrade, Escola Estadual Prof. Ernesto de Castro, Escola Estadual Prof. Amadeu Silva e Escola Estadual Prof. Francisco de Souza. Algumas escolas não foram incluidas nesta lista."
    },
    {
        "offeringId": "offering_noroeste",
        "addon" :"Addon: Os bancos Bradesco e Itau são os preferenciais para financiamento. Não informar outros bancos."
    }
];

exports.getAddons = async function(offeringId) {

    //TODO: this code will query from the DB in the future

    //Retrieve the appearance rate from the environment variables, and use it to selectively return the addons - between 0 and 1
    const showAddon = () => Math.random() < process.env.ADDON_APPEARANCE_RATE;

    if(showAddon){
        console.log('An addon will be shown :' + offeringId)
        //iterate over the list of limits and join the ones that match the type and lang. return the joined string
        const addonMap = addonsFromDB.filter((pAddon) => pAddon.offeringId === offeringId); 
        const addonString = addonMap.map((pAddon) => pAddon.addon).join("\n");
        return addonString;
    }

    return "";    
}