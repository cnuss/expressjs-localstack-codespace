import express from "express";

const app = express();

// GET request to the root of the app
app.get("/", function (req, res) {
  res.send("hello world\n");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server started at 3000");
});
