const admin = require('firebase-admin');
const db = admin.firestore();

const productsDb = db.collection('products');

const VECTOR_INDEX = "products";

class Product {
    constructor(id, params){
        this.id = id;
        this.params = params;
    }
}

exports.putProdut = async (id, params) => {
    const writeResult = await productsDb.doc(id).set({
        params: params
    });
    return writeResult;
}

exports.getProduct = async (id) => {
    const productRef = productsDb.doc(id);
    const doc = await productRef.get();
    if(!doc.exists){
        console.log('no product document found');
        return null;
    }else{
        return doc.data();
    }
}

exports.getProducts = async () => {

    const snapshot = await productsDb.where('params.something', '==', true).get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }  

    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });

    return snapshot;

}
