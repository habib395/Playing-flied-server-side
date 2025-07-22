require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "https://finicky-camp.surge.sh/"],
    credentials: true,
}))
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
    await client.connect();
    const db = client.db("equipmentDB")
    const equipmentCollection = db.collection('equipment')
    const userCollection = db.collection('user')
    const reviewCollection = db.collection("review")

    app.post("/users/:email", async(req, res) =>{
        const email = req.params.email;
        const user = req.body;
        const isExist = await userCollection.findOne({email});
        if(isExist){
            return res.send(isExist)
        }
        const result = await userCollection.insertOne({
            ...user,
            role: "customer",
            timestamp: Date.now()
        })
        res.send(result)
    })

    app.post("/review/:email", async(req, res) =>{
        const email = req.params.email;
        const review = req.body;
        const isExist = await reviewCollection.findOne({email})
        if(isExist){
            return res.send(isExist)
        }
        const result = await reviewCollection.insertOne({
            ...review,
            userEmail: email,
            timestamp: Date.now()
        })
        res.send(result)
    })

    app.get("/reviews/:itemId", async(req, res) =>{
        const itemId = req.params.itemId;
        const reviews = await reviewCollection.find({ itemId}).toArray();
        res.send(reviews)
    })

    app.get('/addEquipment', async(req, res)=>{
        const cursor = equipmentCollection.find().limit(8)
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
        // console.log(email)
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

    app.put('/equipment/:id', async(req, res)=>{
        const id = req.params.id 
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updateEquipment = req.body
        const equipment = {
            $set: {
                ItemName: updateEquipment.ItemName,
                CategoryName: updateEquipment.CategoryName,
                Description: updateEquipment.Description,
                Price: updateEquipment.Price,
                Rating: updateEquipment.Rating,
                Customization: updateEquipment.Customization,
                ProcessingTime: updateEquipment.ProcessingTime,
                StockStatus: updateEquipment.StockStatus,
                Image: updateEquipment.Image
            }
        }

        const result = await equipmentCollection.updateOne(filter, equipment, options)
        res.send(result)
    })

    app.delete('/equipment/:id', async(req, res) => {
        const id = req.params.id 
        const query = { _id: new ObjectId(id) }
        const result = await equipmentCollection.deleteOne(query);
        res.send(result)
    })

  

  
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Assignment ten is running')
})

app.listen(port, () =>{
    console.log(`Simple crud is running on port:${port}`);
})
