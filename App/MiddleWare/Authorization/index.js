const jwt = require('jsonwebtoken')
const constants = require('./../../../Constants')

module.exports = (req, res, next) => {
    if (req.headers.authorization) {
        try {

            const jsonToken = req.headers.authorization.split(' ').pop()
            const decodedData = jwt.verify(jsonToken, 'secret')
            if (decodedData) {
                next()
            }
            else {
                let err = new Error('Unauthorized')
                err['status'] = constants.statusCodes.unAuthorized
                next(err)
            }
        }
        catch (error) {
            let err = new Error('Unauthorized')
            err['status'] = constants.statusCodes.unAuthorized
            next(err)
        }
    }
    else {
        res.status(constants.statusCodes.unAuthorized).json({
            'message': 'Unauthorized'
        })
    }
}