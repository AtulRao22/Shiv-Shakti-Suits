const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const showRoutes = require("./routes/showRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());

// Session (persistent with MongoDB)
app.use(session({
  secret: process.env.SESSION_SECRET || "xyz-fashion-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/yourDB",
    collectionName: "sessions"
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "../public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Set user globally for views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use("/", homeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/show", showRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/", checkoutRoutes);
app.use("/admin", adminRoutes);

// Checkout page route
app.get("/checkout", (req, res) => {
  const checkoutItems = req.session.checkout?.items || [];
  let total = 0;
  checkoutItems.forEach(item => total += item.salePrice * item.qty);

  res.render("checkout", { items: checkoutItems, total });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
