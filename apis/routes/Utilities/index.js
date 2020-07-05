const mongo = require('mongodb').MongoClient

module.exports = {
    getData: function (databaseName, collectionName, keyValue) {
        if (collectionName && keyValue) {
            let data = {}
            mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : 'mongodb://localhost:27017', (error, dbClient) => {
                if (error) {
                    dbClient.close()
                    data['status'] = 'failed'
                    data['message'] = error
                    return data
                }
                else {
                    let projectData = []
                    const database = dbClient.db(databaseName);
                    let dbCursor = database.collection(collectionName).find(keyValue);
                    dbCursor.forEach(project => {
                        projectData.push(project)
                    }, () => {
                        if (projectData > 0) {
                            dbClient.close()
                            data['status'] = 'success'
                            data['data'] = projectData
                            return data
                        }
                        else {
                            dbClient.close()
                            data['status'] = 'failed'
                            data['message'] = 'no data found'
                            return data
                        }
                    })
                }
            })
        }
        else {
            let error = {}
            error['status'] = 'failed'
            error['message'] = 'No collection or identifiers given'
            return error
        }
    }
}
