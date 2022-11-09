const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5jjbyfi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("Wedding-Shots").collection("service");
    const reviewCollection = client.db("Wedding-Shots").collection("review");

    app.get("/allServices", async (req, res) => {
      const query = req.body;
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services", async (req, res) => {
      const query = req.body;
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post("/addServices", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //  add Review

    app.post('/review', async(req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })

    app.get('/review', async (req, res) => {
      const name = req.query.serviceName;
      const query = { serviceName: name };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    })

  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send(`Assignment server is running`);
});

app.listen(port, () => {
  client.connect((err) => {
    console.log(err);
  });

  console.log(`this is assignment server running on ${port} port`);
});
