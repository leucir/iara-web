const getApp = require("firebase/app");
const {getStorage, ref} = require("firebase/storage"); 

const app = getApp();
const storage = getStorage(app);


exports.pushImage = async function (image, path) {
    
    
}