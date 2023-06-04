const {encode, decode} = require('gpt-3-encoder');

exports.countTokens = (async (text) => {
    const str = text;
    const encoded = encode(str)

    return encoded.length;
});