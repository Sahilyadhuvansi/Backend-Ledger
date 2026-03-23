
require("dotenv").config();
require('node:dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require("mongoose");
const User = require("./src/modules/users/user.model");
const Account = require("./src/modules/accounts/account.model");
const axios = require("axios");

async function testTransfer() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for testing");

    // Clear test data if necessary or find existing
    const fromUser = await User.findOne({ email: "tester@example.com" }) || await User.create({ name: "Tester", username: "tester", email: "tester@example.com", password: "password123" });
    const toUser = await User.findOne({ email: "recipient@example.com" }) || await User.create({ name: "Recipient", username: "recipient", email: "recipient@example.com", password: "password123" });

    let fromAcc = await Account.findOne({ user: fromUser._id }) || await Account.create({ user: fromUser._id, balance: 1000, status: "active" });
    let toAcc = await Account.findOne({ user: toUser._id }) || await Account.create({ user: toUser._id, balance: 0, status: "active" });

    console.log(`Test accounts: From (${fromAcc._id}) Balance: ${fromAcc.balance}, To (${toAcc._id}) Balance: ${toAcc.balance}`);

    // Call the local API
    const API_URL = "http://localhost:3002/api";
    
    // Login to get token
    const loginRes = await axios.post(`${API_URL}/auth/login`, { email: "tester@example.com", password: "password123" });
    const token = loginRes.data.data.token;
    console.log("Logged in as tester");

    const transferData = {
      fromAccount: fromAcc._id,
      toAccount: "@recipient",
      amount: 100,
      idempotencyKey: Math.random().toString(36).substring(2)
    };

    console.log("Attempting transfer...");
    try {
      const res = await axios.post(`${API_URL}/transactions`, transferData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Transfer result:", res.data);
    } catch (err) {
      console.error("Transfer FAILED with status:", err.response?.status);
      console.error("Error Response:", JSON.stringify(err.response?.data, null, 2));
      if (err.response?.data?.stack) console.error("Stack Trace:", err.response.data.stack);
    }

  } catch (err) {
    console.error("Test setup error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

testTransfer();
