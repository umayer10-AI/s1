const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const port = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())

const uri = process.env.MY

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const JWKS = createRemoteJWKSet(
    new URL(`${process.env.NEXT}/api/auth/jwks`)
)

const verifydata = async (req,res,next) => {
    const header = req.headers.authorization
    if(!header){
        return res.status(401).json({message: "Unauthorized"})
    }
    const token = header.split(' ')[1]
    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }

    try{
        const { payload } = await jwtVerify(token, JWKS)
        console.log(payload)
        next()
    }
    catch(error){
        return res.status(403).json({message: "Forbidden"})
    }
}

const run = async () => {
    try {
        // await client.connect();

        const db = client.db('concept-2')
        const userCollection = db.collection('myData')

        app.get('/courses', async (req,res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get('/feature', async (req,res) => {
            const result = await userCollection.find().limit(4).toArray()
            res.send(result)
        })

        app.get('/courses/:id',verifydata, async (req,res) => {
            const {id} = req.params
            const query= {
                _id: new ObjectId(id)
            }
            const result = await userCollection.findOne(query)
            res.send(result)
        })

        app.post('/courses',verifydata, async (req,res) => {
            const newUser = req.body
            const result = await userCollection.insertOne(newUser)
            res.send(result)
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } 
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World Umayer Boss')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
