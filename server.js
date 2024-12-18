const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

require("dotenv").config();

app.use(express.json());
app.use(cors());

const MongoClient = require("mongodb").MongoClient;
let db;

app.use((req, res, next) => {
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Status: ${res.statusCode}`);
  if (req.method === "POST" || req.method === "PUT") {
    console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
  }

  console.log("-------------------------");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

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
    console.log("-------------------------");
  }
);

app.get("/", (req, res) => {
  res.send(`
    <h1>Hello!</h1>
    <p>You won't find anything, but here are a few things you can do:</p>
    <ul>
      <li><strong>View activities:</strong> Go to <a href="/collection/activities">/collection/activities</a> to view a list of available activities.</li>
      <li><strong>Search for activities:</strong> Use the search feature by visiting <a href="/collection/activities/search?q=your_search_query">/collection/activities/search?q=your_search_query</a> (replace 'your_search_query' with your desired search terms).</li>
    </ul>
    <p>Feel free to explore!</p>
  `);
});


app.get("/collection/activities", (req, res, next) => {
  db.collection("activities")
    .find({})
    .toArray((err, results) => {
      if (err) return next(err);
      res.send(results);
    });
});

app.post("/collection/orders", (req, res, next) => {
  db.collection("orders2")
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: " Sorry :P, Something went wrong!" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
