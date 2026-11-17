const mongoose = require("mongoose");

// ==========================================
// MONGOOSE CONNECTION OPTIONS
// ==========================================
//
// serverSelectionTimeoutMS:
//   Fail fast (~5s) if MongoDB is unreachable instead
//   of letting the driver try forever and timing out
//   later with an unhelpful "buffering timed out" error.
//
// bufferCommands: false
//   By default Mongoose buffers DB commands while the
//   connection is down, so a query appears to "hang"
//   for 10s and then fails with a confusing timeout.
//   With buffering disabled, a query during a disconnect
//   fails immediately with a clear error. This turns a
//   silent "Network Error" into a fast, actionable one
//   and stops requests from piling up during a reconnect.
//
// ==========================================

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  bufferCommands: false,
};

// ==========================================
// CONNECTION MONITORING
// ==========================================

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:");
  console.error(err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected");
});

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "❌ MONGO_URI is not set. Add it to the backend environment (Render → Environment)."
    );
    throw new Error("MONGO_URI environment variable is missing");
  }

  try {
    const conn = await mongoose.connect(uri, MONGO_OPTIONS);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error.message);

    throw error;
  }
};

module.exports = connectDB;