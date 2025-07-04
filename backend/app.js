const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nftRoutes = require("./routes/nftRoutes");

dotenv.config();
const app = express();

// Configurar CORS ANTES de las otras rutas
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"], // Permitir tu frontend
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/nft", nftRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));