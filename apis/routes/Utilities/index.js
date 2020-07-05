const mongo = require('mongodb').MongoClient

module.exports = {
    getDocuments: function (databaseName, collectionName, keyValue) {
        return new Promise((resolve, reject) => {
            if (collectionName && databaseName) {
                let data = {}
                mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : 'mongodb://localhost:27017', (error, dbClient) => {
                    if (error) {
                        dbClient.close()
                        data['data'] = error
                        // return data
                        reject(data)
                    }
                    else {
                        let documents = []
                        const database = dbClient.db(databaseName);
                        let dbCursor = database.collection(collectionName).find(keyValue);
                        dbCursor.forEach(document => {
                            documents.push(document)
                        }, () => {
                            dbClient.close()
                            resolve(documents)
                        })
                    }
                })
            }
            else {
                reject({
                    'data': 'No collection or identifiers given'
                })
            }
        })
    },
    insertData: function (databaseName, collectionName, dataToInsert) {
        return new Promise((resolve, reject) => {
            if (dataToInsert) {
                mongo.connect('mongodb://localhost:27017', (error, dbClient) => {
                    if (error) {
                        reject({
                            'data': error
                        })
                    }
                    else {
                        const database = dbClient.db(databaseName)
                        database.collection(collectionName).insertOne(dataToInsert, (err, result) => {
                            if (err) {
                                reject({
                                    'data': err
                                })
                            }
                            else {
                                resolve({
                                    'data': 'inserted'
                                })
                            }
                        })
                    }
                })
            }
            else {
                reject({
                    'data': 'No data found'
                })
            }
        })
    }
}