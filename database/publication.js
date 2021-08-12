const mongoose = require("mongoose");

const PubSchema = mongoose.Schema(
    {
        id: Number,
        name: String,
        books: [String]
    }
);

const PubModel = mongoose.model("publications",PubSchema);

module.exports = PubModel;