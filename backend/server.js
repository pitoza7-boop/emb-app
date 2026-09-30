const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Route de test
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EMB PayTech backend fonctionne"
  });
});

// Créer un paiement PayTech
app.post("/payment", async (req, res) => {
  try {
    const { item_name, item_price, ref_command } = req.body;

    if (!item_name || !item_price || !ref_command) {
      return res.status(400).json({
        success: 0,
        message: "Informations de paiement manquantes"
      });
    }

    const paymentData = {
      item_name,
      item_price,
      currency: "XOF",
      ref_command,
      command_name: `Commande EMB - ${item_name}`,
      env: "test"
    };

    const response = await fetch(
      "https://paytech.sn/api/payment/request-payment",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "API_KEY": process.env.PAYTECH_API_KEY,
          "API_SECRET": process.env.PAYTECH_API_SECRET
        },
        body: JSON.stringify(paymentData)
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: 0,
      message: "Erreur du serveur EMB"
    });
  }
});

app.listen(PORT, () => {
  console.log(`EMB backend démarré sur le port ${PORT}`);
});
