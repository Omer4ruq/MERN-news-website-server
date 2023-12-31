const express = require("express");
const app = express();
const cors = require("cors");
// const stripe = require("strip")(process.env.STRIPE_SECRET_KEY);
// const jwt = require("jsonwebtoken");
require("dotenv").config();
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.npoax.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const newsCollection = client.db("newspaperDB").collection("news");
    const userCollection = client.db("newspaperDB").collection("users");
    const articleCollection = client.db("newspaperDB").collection("articles");
    const publisherCollection = client
      .db("newspaperDB")
      .collection("publishers");
    // news
    app.get("/all-news", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("user", user);
      const existingUser = await userCollection.findOne({ email: user.email });
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
      // res.send({ message: "post users api called" });
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // subscribtion
    app.patch("/userspremium", async (req, res) => {
      const { email, subscriptionPlan } = req.body;
      // const email = req.query.email;
      console.log(email);
      const { premiumTaken } = subscriptionPlan;
      const currentDate = new Date();
      let query = {};
      if (req.query?.email) {
        const query = { email: req.query.email };
      }
      let subscriptionEndDate;
      console.log(premiumTaken);
      if (premiumTaken == "5") {
        console.log("ami aci");
        subscriptionEndDate = new Date(currentDate.getTime() + 5 * 60 * 1000);
      } else if (premiumTaken === 1) {
        subscriptionEndDate = new Date(currentDate.getTime() + 1 * 60 * 1000);
      }
      const updatedDoc = {
        $set: {
          premiumTaken: subscriptionEndDate,
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    // Aarticles
    app.post("/article", async (req, res) => {
      const newArticle = req.body;
      console.log(newArticle);
      const result = await articleCollection.insertOne(newArticle);
      res.send(result);
    });

    app.get("/my-article", async (req, res) => {
      console.log(req.query.email);
      // if (req.email.email !== req.query.email) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await articleCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/articleSearch", async (req, res) => {
      const filter = req.query;
      console.log(filter.search);

      const query = {
        articleTitle: { $regex: filter.search },
      };

      const cursor = articleCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/article", async (req, res) => {
      const result = await articleCollection.find().toArray();
      res.send(result);
    });

    app.get("/article/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      // console.log("query" + query);
      // const result = await productCollection.findOne(query);
      const result = await articleCollection.findOne(query);
      console.log(result);
      res.send(result);
      // product details
    });
    app.delete("/article/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      // console.log("query" + query);
      // const result = await productCollection.findOne(query);
      const result = await articleCollection.deleteOne(query);
      console.log(result);
      res.send(result);
      // product details
    });

    app.patch("/article/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: item.status,
        },
      };

      const result = await articleCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/articlepremium/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          premium: item.premium,
        },
      };

      const result = await articleCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/articleViews/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          views: item.views,
        },
      };

      const result = await articleCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch("/articleNote/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          adminNote: item.adminNote,
        },
      };

      const result = await articleCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // publishers
    app.post("/publisher", async (req, res) => {
      const item = req.body;
      const result = await publisherCollection.insertOne(item);
      res.send(result);
    });

    app.get("/publisher", async (req, res) => {
      const publisher = req.body;
      console.log(publisher);

      const result = await publisherCollection.find(publisher).toArray();
      res.send(result);
    });

    // payment
    // app.post("/create-payment-intent", async (req, res) => {
    //   const { price } = req.body;
    //   const amount = parseInt(price * 100);
    //   console.log(amount, "amount inside the intent");

    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: amount,
    //     currency: "usd",
    //     payment_method_types: ["card"],
    //   });

    //   res.send({
    //     clientSecret: paymentIntent.client_secret,
    //   });
    // });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
