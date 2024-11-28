const express = require("express");
const app = express();

app.use(express.json());
app.set("port", 3000);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});