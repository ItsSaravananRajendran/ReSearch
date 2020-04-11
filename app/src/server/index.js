const path = require("path");
const express = require("express");
const app = express();
const MODE =
  process.env.NODE_ENV === "production" ? "production" : "development";
const config = require("./config")[MODE];

const { port, dist } = config;

app.use("/", express.static(`${__dirname}/${dist}`));

// express will serve up index.html if it doesn't recognize the route
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, dist, "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
