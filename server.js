const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

require("dotenv").config();

app.use(express.json());
app.set("port", 3000);
app.use(cors());

app.use("/images", express.static(path.join(__dirname, "images")));

const MongoClient = require("mongodb").MongoClient;
let db;

MongoClient.connect(
  process.env.MONGO_URI,
  { useUnifiedTopology: true },
  (err, client) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      return;
    }
    db = client.db("mountup");
    console.log("Database connected successfully");
  }
);

app.get("/collection/activities", (req, res, next) => {
  db.collection("activities")
    .find({})
    .toArray((err, results) => {
      if (err) return next(err);
      res.send(results);
    });
});

app.post("/collection/orders", (req, res, next) => {
  db.collection("orders")
    .insertOne(req.body)
    .then((result) => res.status(201).send(result))
    .catch((error) => next(error));
});

const ObjectID = require("mongodb").ObjectID;
app.put("/collection/activities/:id", (req, res, next) => {
  const activityId = req.params.id;
  const vacancy = req.body.vacancy;

  if (vacancy === undefined) {
    return res.status(400).send({ error: "Vacancy value is required." });
  }

  db.collection("activities").updateOne(
    { _id: new ObjectID(activityId) },
    { $set: { vacancy: vacancy } },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(
        result.result.n === 1
          ? { msg: "Vacancy updated successfully." }
          : { msg: "Activity not found." }
      );
    }
  );
});

app.get("/collection/activities/search", (req, res, next) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).send({ error: "Search query is required" });
  }

  db.collection("activities")
    .find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
        { price: parseInt(searchQuery) },
        { vacancy: parseInt(searchQuery) },
      ],
    })
    .toArray((err, results) => {
      if (err) {
        console.error("Error:", err);
        return next(err);
      }
      res.send(results);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
