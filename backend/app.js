const express = require("express");
const dotenv = require("dotenv");
const nftRoutes = require("./routes/nftRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/nft", nftRoutes); // ruta base

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
