const offeringTopics = [{
    "offeringId": "offering_noroeste",
    "topics" :"[empreendimento imobiliarios, apartamentos, noroeste de Brasilia, farmacias, escolas, bancos, financiamento, imoveis, imobiliaria, compra, venda]"
}];

exports.getSupportedTopics = async function(offeringId) {

    const SUPPORT_TOPICS_PREFIX = 'supported_topics_ = ';

    //TODO: this code will query from the DB in the future

    //iterate over the list of topics and join the ones that match the type and lang. return the joined string
    const topicsMap = offeringTopics.filter((topic) => topic.offeringId === offeringId); 
    var topicString = SUPPORT_TOPICS_PREFIX + topicsMap.map((topic) => topic.topics).join("\n");
    
    //return topicString if it is not empty, otherwise return a generic topic, inline
    return topicString;

}