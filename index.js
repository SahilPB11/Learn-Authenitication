import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { log } from "console";
const app = express();
// connected the nodejs with mongodb
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

// making a schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});
const User = mongoose.model("User", userSchema);

// using static folder
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Setting up the view engine
app.set("view engine", "ejs");

// making a function to chek is session in work or not
const isAuthenticated = async(req, res, next) => {
  const { token } = req.cookies;
  if (token){
    const decoded = jwt.verify(token,"jixjksdjcjjkdjkckjdxjcjkjkk");
    req.user = await User.findById(decoded._id);
    next();
  }
  else res.render("login");
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", {name: req.user.name});
});

// register 
app.get("/register", (req, res) => {
  res.render("register");
});

// login handler 
app.post("/login", async(req, res) => {
  const { name, email } = req.body;
  let user = await User.findOne({email});
  if(!user){
    return res.redirect("/register");0
  }else{
    user = await User.findOne({name,email});

    const userToken = jwt.sign({_id:user._id}, "jixjksdjcjjkdjkckjdxjcjkjkk");
      res.cookie("token", userToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
      });
      res.redirect("/");
  }
});

// register page
app.post("/register", async(req, res) => {
  const { name, email } = req.body;
  const user = await User.create({name,email});
  res.redirect("/");
});

// logout handler
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// server connection
app.listen(3000, (req, res) => {
  console.log("app is working");
});
