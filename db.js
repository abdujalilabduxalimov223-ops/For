const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:admin123456@cluster0.xplu66f.mongodb.net/informatika",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => {
  console.log("MongoDB connected");
})
.catch(err => {
  console.error("MongoDB error:", err);
});

module.exports = mongoose;
