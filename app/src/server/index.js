const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const MODE =
  process.env.NODE_ENV === "production" ? "production" : "development";
const config = require("./config")[MODE];

const { port, dist } = config;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use("/", express.static(`${__dirname}/${dist}`));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://www.dev.me:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// express will serve up index.html if it doesn't recognize the route
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, dist, "index.html"));
});

app.get("/getData", (req, res) => {
  const value = req.body.value;
  res.send({ wow: "awesome" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
