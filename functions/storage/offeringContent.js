const getApp = require("firebase/app");
const {getStorage, ref} = require("firebase/storage"); 

exports.getMediaURLsFromUniqueIds = async function (uniqueIds) {
    urls = [];
    if(uniqueIds.length > 0){
        response = {
          response: responseChat.response,
          urls: uniqueIds.map((entry) => {
            return {
              url: "https://www.vivareal.com.br/" + entry,
              uniqueId: entry
            }
          })
        }
      }
    return urls; 
    
}