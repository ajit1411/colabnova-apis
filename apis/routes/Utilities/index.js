const mongo = require('mongodb').MongoClient

module.exports = {
    getDocuments: function (databaseName, collectionName, identifiers = {}, projections = {'_id': 0}) {
        return new Promise((resolve, reject) => {
            if (collectionName && databaseName) {
                let data = {}
                projections['_id'] = 0
                mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : 'mongodb://localhost:27017', (error, dbClient) => {
                    if (error) {
                        dbClient.close()
                        data['data'] = error
                        reject(data)
                    }
                    else {
                        let documents = []
                        const database = dbClient.db(databaseName);
                        let dbCursor = database.collection(collectionName).find(identifiers).project(projections);
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
                mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : 'mongodb://localhost:27017', (error, dbClient) => {
                    if (error) {
                        reject({
                            'data': error
                        })
                    }
                    else {
                        const database = dbClient.db(databaseName)
                        database.collection(collectionName).insertOne(dataToInsert, (err, result) => {
                            if (err) {
                                dbClient.close()
                                reject({
                                    'data': err
                                })
                            }
                            else {
                                dbClient.close()
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
    ,
    updateDocument: function (databaseName, collectionName, identifiers, dataToUpdate) {
        return new Promise((resolve, reject) => {
            if (dataToUpdate) {
                mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : 'mongodb://localhost:27017', (error, dbClient) => {
                    if (error) {
                        reject({
                            'data': error
                        })
                    }
                    else {
                        const database = dbClient.db(databaseName)
                        database.collection(collectionName).updateOne(identifiers, { '$set': dataToUpdate }, (err, result) => {
                            if (err) {
                                dbClient.close()
                                reject({
                                    'data': err
                                })
                            }
                            else {
                                dbClient.close()
                                resolve({
                                    'data': 'updated'
                                })
                            }
                        })
                    }
                })
            } else {
                reject({
                    'data': 'No data found'
                })
            }
        })
    }
}