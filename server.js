const express = require("express");
const app = express();

app.use(express.json());
app.set("port", 3000);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

const MongoClient = require("mongodb").MongoClient;
let db;

MongoClient.connect(
  "mongodb+srv://zainabkhatoon3104:rootpassword@cluster0.dfc2p.mongodb.net/",
  (err, client) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      return;
    }
    db = client.db("mountup");
    console.log("Database connected successfully");
  }
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
