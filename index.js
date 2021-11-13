const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kd44i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log("DB connected");
    const database = client.db('nicheWebsite');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');
    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('reviews');

    // save registered user to the database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    })

    // post Products to database 
    app.post('/addProduct', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    })

    // Get All products
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      // console.log(result);
      res.send(result);
    })

    // Get specific product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      console.log(product);
      res.send(product);

    })

    // Delete a product
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);

    })

    // Post order
    app.post('/addOrders', async (req, res) => {
      const order = req.body;
      console.log("Order", order);
      const result = await ordersCollection.insertOne(order);
      console.log(result);
      res.json(result);
    })
    // Get all orders
    app.get('/orders', async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    })

    //Get specific users order
    app.get('/orders/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: req.params.email };
      console.log(email);
      const myOrders = await ordersCollection.find(query).toArray();
      console.log(myOrders);
      res.send(myOrders);
    })
    // Delete an Order
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    })

    // Update shipping status
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedStatus = req.body.status;
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: updatedStatus,
        },
      });
      res.send(result);
      console.log(result);
    });

    //add review to the database
    app.post('/addReview', async (req, res) => {
      const review = req.body;
      // console.log(review);
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    })
    //get all review 
    app.get('/allReviews', async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      // console.log(result);
      res.json(result);
    })

    // Make admin
    app.put('/makeAdmin',async (req,res)=>{
      const filter={email:req.body.email};
      const document={$set:{role:"admin"}};
      const result=await usersCollection.updateOne(filter,document);
      console.log(result);
      res.send(result);
    })
  
    // Check Admin
    app.get('/users/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const user=await usersCollection.findOne(query);
      let isAdmin=false;
      if(user?.role==='admin')
      {
        isAdmin=true;
      }
      res.json({admin:isAdmin});
    })

  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Running Niche Product Server');
});

app.listen(port, () => {
  console.log('Running Niche Product Server on port', port);
})