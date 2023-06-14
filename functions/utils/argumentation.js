const format = require("string-template");
const { conditions } = require("../data/conditions_1.json");
const prompt = require("../data/prompts_1.json");
const { contexts } = require("../data/contexts_1.json");
const { products } = require("../data/products_1.json");

const getArgumentation = (history='',max_tokens=100) => {
  let argumentation =
    'Olá, preciso que lembre deste seguinte contexto para uma conversa sobre empreeendimentos imobiliários: \"{products}\". ' +
    'Addon: As farmácias mais próximas aos empreendimentos imobiliários da Quadra 102 são a Farmácia Pague Menos (61 3314-1000), a Farmácia Droga Raia (61 3314-1000). '+
    'Addon: Os empreendimentos imobiliários da quadra 102 estão próximos às seguintes escolas de segundo grau: Escola Estadual Profa. Leda Nakano, Colégio Estadual Carlos Drummond de Andrade, Escola Estadual Prof. Ernesto de Castro, Escola Estadual Prof. Amadeu Silva e Escola Estadual Prof. Francisco de Souza. Algumas escolas não foram incluidas nesta lista.'+
    'Addon: Os empreendimentos imobiliários estão sendo financiados preferencialmente pelo Itau e Bradesco. Não informar outros bancos.'+
    'Existem 3 tipos de SALES_PITCH:'+
    '1) CALL_TO_ACTION: existe uma change consideravel de compra. Pergunte se o cliente deseja conversar com um atendente.'+
    '2) INITIAL_ENGAGE: o cliente está conhecendo os produtos. Escolha 2 produtos aleatoriamente e apresente as suas caracteristicas'+
    '3) POTENTIAL_TO_BUY: o cliente quer comprar um imóvel. Ofereça mais informações sobre as opções de pagamento.'+
    '4) PRESENT_PRODUCTS: o cliente quer saber mais dos imóveis. Adicione algumas informações sobre os addon.'+
    'Randomicamente, adicione informações relacionado aos ADDONS.'+
    'Caso a pergunta não esteja relacionado a lista de supported_topics, responda educadamente que a pergunta não pode se respondida no momento.'+
    'Não responda o que não se pode responder. '+
    '"NÃO RESPONDA COM TEXTOS OU PALAVRAS TRUNCADAS", responda com um texto legível, com um início, meio e fim que faça sentido, dentro do número máximo de tokens, que é de {max_tokens}, sendo o token calculado pelos critérios da OpenAi. Caso sua resposta inicial ultrapasse a limite máximo de tokens, refine e resume até que chegue no limite, podendo descartar algumas informações, palavras, ou sentenças que ficariam truncadas ou causaria truncamento no final do texto' +
    '{coditionsText}'+
    'Tambeḿ, quero que continue a conversa a partir desse histórico de conversa: \"{history}\"'


  const conditionsText = conditions.map(c=>c.value).join('\n');
  const allProducts = products.map(p=>format(contexts[0].corpus, p)).join(", ");

  argumentation = format(argumentation, { products: allProducts, conditionsText, history, max_tokens });

  return argumentation;
};

module.exports = { getArgumentation };