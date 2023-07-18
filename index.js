import express from "express";
import path from "path";
import mongoose from "mongoose";
mongoose
.connect("mongodb://127.0.0.1:27017/backend", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("mango is ready to eat");
  })
  .catch((err) => {
    console.log(err);
  });


  const mongooseSchema = new mongoose.Schema({
    name:String,
    email:String,
  });
const Message = mongoose.model("Message", mongooseSchema);
const app = express();

// using static folder
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
// Setting up the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  console.log(req.cookies);
  res.render("login");
});

app.get("/add", async(req, res) => {
  await Message.create({name: "ai", email: "haga@hhh"});
  res.send("Success")
  console.log("working");
});

app.get("/success", (req, res) => {
  res.send("success");
});

app.post("/", (req, res) => {
   Message.create({name: req.body.name, email: req.body.email}).then(() => {
     res.redirect("/")
     console.log("working");
   })
});

app.post("/login", (req, res) => {
  res.cookie("token", "maiaagyo", {
    httpOnly:true, expires:new Date(Date.now() + 60*1000),
  });
  res.redirect("/");
})

app.listen(3000, (req, res) => {
  console.log("app is working");
});
