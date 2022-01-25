const express = require('express')
var MongoClient = require('mongodb').MongoClient;
const app = express()
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


      
      





    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);









app.listen(port, () =>{
    console.log('port running', port);
})