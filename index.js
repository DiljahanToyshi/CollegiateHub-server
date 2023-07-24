const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ist6ay7.mongodb.net/?retryWrites=true&w=majority`;
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

    const collegeCollection = client.db("CollegeDb").collection("Data");
    const reviewCollection = client.db("CollegeDb").collection("reviews");
    const usersCollection = client.db("CollegeDb").collection("users");
    const enrolledCollection = client.db("CollegeDb").collection("enroll");


   // users related apis
  

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);

      res.send(result);
    });


    app.get('/college', async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    app.get('/college/:id', async (req, res) => {

      const id = req.params.id;

      const query = { _id: new ObjectId(id) }
      const result = await collegeCollection.findOne(query)
      res.send(result);

    })

    // enroll api
    app.get('/enroll',async (req, res) => {
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await enrolledCollection.find(query).toArray();
      res.send(result);
  })

    app.get('/enroll/:id', async (req, res) => {

      const id = req.params.id;

      const query = { _id: new ObjectId(id) }
      const result = await enrolledCollection.findOne(query)
      res.send(result);

    })
    app.post('/enroll', async (req, res) => {
      const item = req.body;
       console.log(item)
      const result = await enrolledCollection.insertOne(item);
      res.send(result);
    })

 

   
   

    // review related apis
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    app.get("/getJobsByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await collegeCollection
        .find({
          $or: [
           
            { college: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


   


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Collegiate Hub  is sitting')
})

app.listen(port, () => {
  console.log(`Collegiate Hub is sitting on port ${port}`);
})


