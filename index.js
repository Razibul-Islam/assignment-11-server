const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("Wedding-Shots").collection("service");
    const reviewCollection = client.db("Wedding-Shots").collection("review");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.get("/allServices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ _id: -1 });
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

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const name = req.query.serviceName;
      const query = { serviceName: name };
      const result = await reviewCollection
        .find(query)
        
        .toArray();
      res.send(result);
    });

    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const reviewOne = await reviewCollection.findOne(query);
      res.send(reviewOne);
    });

    // My Review

    app.get("/MyReview", verifyJWT, async (req, res) => {
      // console.log(req.headers.authorization);
      const email = req.query.email;
      // console.log(email);
      const query = { email };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    // Delete Review

    app.delete("/reviewDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await reviewCollection.deleteOne(query);
      res.send(service);
    });

    // update Review

    app.put("/updateReview/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedReview = req.body;
      const option = { upsert: true };
      const updateReviews = {
        $set: {
          rating: updatedReview.rating,
          message: updatedReview.message,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateReviews,
        option
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send(`Assignment server is running`);
});

app.listen(port, () => {
  client.connect((err) => {
    // console.log(err);
  });

  // console.log(`this is assignment server running on ${port} port`);
});
