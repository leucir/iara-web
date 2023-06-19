/* 
a function to read a json file and convert it to a text file. Every json object will be parsed and it will be a new file in the text file. Every line will have a separator like "###" to separate the json objects.
*/

const fs = require("fs");
const path = require("path");
const format = require("string-template");

convertJsonToDocs = async () => {

    const jsonPath = path.join(__dirname, "../../data/orig/realestate/products_1.json");
    const templatePath = path.join(__dirname, "../../data/orig/realestate/template_1.json");
    const txtPath = path.join(__dirname, "data.txt");

    const json = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(json);

    const template = fs.readFileSync(templatePath, "utf8");
    const templateData = JSON.parse(template);

    const txt = data.products.map((item) => {
        //JSON.stringify(item);
        const ts = JSON.stringify(templateData.value);

        console.log(item);
        
        return format(ts, item);


    }).join("//****//");    //chuck separator for the embedding model

    fs.writeFileSync(txtPath, txt);
};


convertJsonToDocs();


