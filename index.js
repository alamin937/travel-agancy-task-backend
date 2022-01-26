const express = require('express')
var MongoClient = require('mongodb').MongoClient;
const app = express()
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const cors = require('cors')

const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req,res) =>{
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



      app.post('/users', async(req,res) =>{
          const user = req.body;
          const result = await userCollection.insertOne(user)
          console.log(req.body);
          console.log(result);
          res.json(result);
      })

      app.put('/users/admin', async(req,res) =>{
        const user = req.body;
        const filter = {email: user.email}
        const updateDoc = {$set: {role:'admin'}}
        const result = await userCollection.updateOne(filter,updateDoc)
        res.send(result);
      })


      app.get('/users/:email', async(req,res) =>{
            const email = req.params.email;
            const query = {email: email}
            const result = await userCollection.findOne(query)
            let isAdmin = (false)
            if(result?.role === "admin")
            {
              isAdmin = true
            }
            res.json({admin: isAdmin})
      })


      app.post('/experience', async(req,res) =>{
          const experience = req.body;
          const result = await experienceCollection.insertOne(experience)
          console.log(req.body)
          console.log(result)
          res.json(result);
      })

      app.get('/experience', async(req,res) =>{
          const cursor = experienceCollection.find({})
          const page = req.query.page;
          const size = parseInt(req.query.size);
          let result;
          const count = await cursor.count()
          if(page){
            result = await cursor.skip(page*size).limit(size).toArray()
          }
          else{
            result = await cursor.toArray()
          }
         
          res.send({
            count,
            result
            
          });
      })

      app.get('/experience/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await experienceCollection.findOne(query)
            res.send(result);
      })
      
      





    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);









app.listen(port, () =>{
    console.log('port running', port);
})