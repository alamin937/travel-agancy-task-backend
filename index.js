const express = require('express')
var MongoClient = require('mongodb').MongoClient;
const app = express()
const ObjectId = require('mongodb').ObjectId
const fileUpload = require('express-fileupload')
require('dotenv').config()
const cors = require('cors')

const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload())


app.get('/', (req, res) => {
  res.send('Hello World')
})


var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.bzphb.mongodb.net:27017,cluster0-shard-00-01.bzphb.mongodb.net:27017,cluster0-shard-00-02.bzphb.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-rs3vfq-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db("Travel");
    const blogCollection = database.collection("Blog");
    const userCollection = database.collection("user")
    const experienceCollection = database.collection("experience")
    const placeorderCollection = database.collection("placeorder")



    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user)
      console.log(req.body);
      console.log(result);
      res.json(result);
    })

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email }
      const updateDoc = { $set: { role: 'admin' } }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result);
    })


    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await userCollection.findOne(query)
      let isAdmin = (false)
      if (result?.role === "admin") {
        isAdmin = true
      }
      res.json({ admin: isAdmin })
    })


    app.post('/experience', async (req, res) => {
      const experience = req.body;
      const result = await experienceCollection.insertOne(experience)
      console.log(req.body)
      console.log(result)
      res.json(result);
    })

    app.get('/experience', async (req, res) => {
      const cursor = experienceCollection.find({})
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let result;
      const count = await cursor.count()
      if (page) {
        result = await cursor.skip(page * size).limit(size).toArray()
      }
      else {
        result = await cursor.toArray()
      }

      res.send({
        count,
        result

      });
    })

    app.get('/experience/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await experienceCollection.findOne(query)
      res.send(result);
    })


    app.post('/blogs', async (req, res) => {
      const title = req.body.title
      const info = req.body.info
      const description = req.body.description
      const category = req.body.category
      const cost = req.body.cost
      const location = req.body.location
      const pic = req.files.img
      const picData = pic.data;
      const encodePic = picData.toString('base64');
      const picBuffer = Buffer.from(encodePic, 'base64');
      const image = {
        title,
        info,
        description,
        category,
        cost,
        location,
        img: picBuffer

      }
      const result = await blogCollection.insertOne(image)
      res.json(result)
    })


    app.get('/blogs', async (req, res) => {
      const cursor = blogCollection.find({})
      const result = await cursor.toArray()
      res.send(result);
    })

    app.delete('/blogs/:id', async(req,res) =>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)}
          const result = await blogCollection.deleteOne(query)
          res.send(result)
    })


    app.get('/blogs/:id', async(req,res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await blogCollection.findOne(query)
        res.send(result)
    })


    app.put('/blogs/:id', async(req,res) =>{
          const id = req.params.id;
          const update = req.body;
          const filter = {_id:ObjectId(id)}
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              title: update.title,
              cost: update.cost
            },
          };
          const result = await blogCollection.updateOne(filter, updateDoc, options);
          console.log(result)
          res.send(result)

    })



    app.post('/placeorder', async(req,res) =>{
        const placeorder = req.body;
        const result = await placeorderCollection.insertOne(placeorder)
        console.log(req.body);
        console.log(result)
        res.json(result) 
    })


    app.get('/placeorder/:email', async(req,res) =>{
          const email = req.params.email;
          const query ={email: email}
          const cursor = placeorderCollection.find(query)
          const result = await cursor.toArray()
          res.send(result);
    })


    app.delete('/placeorder/:id', async(req,res) =>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)}
          const result = await placeorderCollection.deleteOne(query)
          res.send(result);
    })






  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);









app.listen(port, () => {
  console.log('port running', port);
})