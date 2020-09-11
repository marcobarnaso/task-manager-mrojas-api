const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {

    try {
        
        const token = req.header('Authorization').replace('Bearer ', '') // here we take the token from the header and remove the word 'bearer' from it 
        // here we verify the token against the secret key to make sure the token is valid, jtw.verify returns the token decoded
        // in this case the token contains the _id, which is the value we gave it when we created it, and iat(issued at which is the timestamp at which the token is created)
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        // here we take use findOne with the user model to find the user by id and token, decoded contains the _id
        // the other parameter is to look inside the tokens array in the user model and compare it with the token  
        const user = await User.findOne({_id: decoded._id, 'tokens.token' : token}) 
        if(!user) {
            throw new Error()
        }
        

        req.token = token
        // we are storing the user in the request with req.xxx and giving it the value of the user
        // this way we dont have to fetch the user again in the router
        req.user = user
        next()

    } catch (error) {
        res.status(401).send({error: 'Please authenticate.'})
    }        
}

module.exports = auth