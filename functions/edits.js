const functions = require('firebase-functions');

const axios = require('axios');
const cors = require('cors')({ origin: true });

const config = {
    headers : {Authorization: 'Bearer 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'}
};

exports.create = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== "GET") {
          return res.status(401).json({
            message: "Not allowed"
          });
        }

        return axios.post('https://api.openai.com/v1/edits',
        {
            "model": "text-davinci-edit-001",
            "input": "What day of the wek is it?",
            "instruction": "Fix the spelling mistakes",
        },
        config)
        .then(response => {
            console.log(response.data);
            return res.status(200).json({
            message: response.data
            })
        })
        .catch(err => {
            return res.status(500).json({
            error: err
            })
        }) 
    })  

});