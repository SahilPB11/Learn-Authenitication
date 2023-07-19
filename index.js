import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt";
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
  password: String,
});
const User = mongoose.model("User", userSchema);

// using static folder
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Setting up the view engine
app.set("view engine", "ejs");

// making a function to chek is session in work or not
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "jjhjhjxxxhjchuiufiuiufihugy");
    req.user = await User.findOne({ _id: decoded._id });
    next();
  } else res.render("login");
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

// register
app.get("/register", (req, res) => {
  res.render("register");
});

// login
app.get("/login", (req, res) => {
  res.render("login");
});

// login handler
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email: email });
  if (!user) return res.redirect("/register");
  const isMath = await bcrypt.compare(req.body.password, user.password);
  if (isMath === false) {
    res.render("login", { email: user.email, message: "password is wrong" });
    return;
  }
  const token = jwt.sign({ _id: user._id }, "jjhjhjxxxhjchuiufiuiufihugy");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

// register page
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (user) {
    return res.redirect("/login");
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    res.redirect("/login");
  }
});
// logout handler
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/login");
});

// server connection
app.listen(3000, (req, res) => {
  console.log("app is working");
});
