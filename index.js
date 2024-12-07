const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6aryg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const equipmentCollection = client.db('equipmentDB').collection('equipment')

    app.get('/addEquipment', async(req, res)=>{
        const cursor = equipmentCollection.find().limit(6)
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/addEquipments', async(req, res) =>{
        const cursor = equipmentCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/equipment/:email/:id', async(req, res) =>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const result = await equipmentCollection.findOne(query) 
        res.send(result)
    })

    app.post('/addEquipment', async(req, res) =>{
        const newEquipment = req.body
        // console.log(newEquipment);
        const result = await equipmentCollection.insertOne(newEquipment)
        res.send(result)
    })

    app.get('/equipment/:email', async(req, res) =>{
        const email = req.params.email 
        if(!email){
            return res.status(400).send({ message: 'Email is required'})
        } 
        const cursor = equipmentCollection.find({ UserEmail : email })
        const result = await cursor.toArray()
        if(result.length === 0){
                    return res.status(404).send({ message: ' Unfortunately , No equipment found for this user.'})
                }
        res.send(result)

    })

    app.delete('/equipment/:id', async(req, res) => {
        const id = req.params.id 
        const query = { _id: new ObjectId(id) }
        const result = await equipmentCollection.deleteOne(query);
        res.send(result)
    })

  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Assignment ten is running')
})

app.listen(port, () =>{
    console.log(`Simple crud is running on port:${port}`);
})
