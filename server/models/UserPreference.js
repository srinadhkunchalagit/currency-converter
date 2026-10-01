const mongoose = require("mongoose");

const historyEntrySchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    result: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userPreferenceSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    lang: { type: String, default: "en" },
    favorites: { type: [String], default: [] },
    multiTargets: { type: [String], default: ["INR", "EUR", "GBP"] },
    history: { type: [historyEntrySchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
