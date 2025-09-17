

exports.recordPass = async function(functionName, operationName, eventName){
    console.log(functionName + 
    " - " + 
    operationName + 
    " - " +
    eventName +
    " - " +
    new Date().toISOString());
}