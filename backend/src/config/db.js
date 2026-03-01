const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Critical: Error connecting to Database", err.message);
    process.exit(1);
  }
}

module.exports = connectToDB;
