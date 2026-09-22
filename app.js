if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbURL = process.env.ATLASDB_URL;
const SESSION_SECRET = process.env.SECRET;
const PORT = process.env.PORT || 3000;

if (!dbURL) {
  console.error("ERROR: ATLASDB_URL is not configured.");
  process.exit(1);
}

if (!SESSION_SECRET) {
  console.error("ERROR: SECRET is not configured.");
  process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.set("trust proxy", 1);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("ERROR IN MONGO SESSION STORE:");
  console.error(err);
});

const sessionOptions = {
  store,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "StayVista server is running",
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || "development",
    mongodb:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not connected",
  });
});

app.get("/api/mapbox-token", (req, res) => {
  if (!process.env.MAP_TOKEN) {
    return res.status(500).json({
      error: "Mapbox token not configured",
    });
  }

  res.json({
    token: process.env.MAP_TOKEN,
  });
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  const err = new Error("Page not found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error("APPLICATION ERROR:");
  console.error(err);

  const {
    statusCode = 500,
    message = "Something went wrong",
  } = err;

  res.status(statusCode).render("error.ejs", {
    message,
    currUser: req.user || null,
  });
});

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(dbURL);

    console.log("Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("FAILED TO START SERVER");
    console.error(error);
    process.exit(1);
  }
}

startServer();