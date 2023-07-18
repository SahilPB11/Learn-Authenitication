import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
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

// making a function
const isAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (token) next(); 
  else res.render("login");
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});

// login handler && adding a data in database
app.post("/login", async(req, res) => {
  const { name, email } = req.body;
 const user = await User.create({name,email});

  res.cookie("token", user._id, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
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
