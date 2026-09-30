const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL;


// ===============================
// ROUTE DE TEST
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EMB PayTech backend fonctionne"
  });
});


// ===============================
// CRÉER UN PAIEMENT PAYTECH
// ===============================

app.post("/payment", async (req, res) => {
  try {
    const { item_name, item_price, ref_command } = req.body;

    if (!item_name || !item_price || !ref_command) {
      return res.status(400).json({
        success: 0,
        message: "Informations de paiement manquantes"
      });
    }

    if (!BACKEND_URL) {
      return res.status(500).json({
        success: 0,
        message: "BACKEND_URL non configurée sur Render"
      });
    }

    const paymentData = {
      item_name: String(item_name),
      item_price: Number(item_price),
      currency: "XOF",
      ref_command: String(ref_command),
      command_name: `Commande EMB - ${item_name}`,
      env: "test",

      ipn_url: `${BACKEND_URL}/ipn`,
      success_url: `${BACKEND_URL}/payment/success`,
      cancel_url: `${BACKEND_URL}/payment/cancel`
    };

    const response = await fetch(
      "https://paytech.sn/api/payment/request-payment",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          API_KEY: process.env.PAYTECH_API_KEY,
          API_SECRET: process.env.PAYTECH_API_SECRET
        },
        body: JSON.stringify(paymentData)
      }
    );

    const data = await response.json();

    console.log("Réponse PayTech :", data);

    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Erreur paiement :", error);

    return res.status(500).json({
      success: 0,
      message: "Erreur du serveur EMB"
    });
  }
});


// ===============================
// IPN PAYTECH
// ===============================

app.post("/ipn", (req, res) => {
  try {
    const {
      type_event,
      item_name,
      item_price,
      final_item_price,
      ref_command,
      token,
      api_key_sha256,
      api_secret_sha256,
      hmac_compute
    } = req.body;

    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Clés PayTech absentes");
      return res.status(500).send("Configuration error");
    }

    // ===============================
    // VÉRIFICATION HMAC
    // ===============================

    if (hmac_compute) {
      const amount = final_item_price || item_price;

      const message = `${amount}|${ref_command}|${apiKey}`;

      const expectedHmac = crypto
        .createHmac("sha256", apiSecret)
        .update(message)
        .digest("hex");

      const validHmac =
        hmac_compute.length === expectedHmac.length &&
        crypto.timingSafeEqual(
          Buffer.from(hmac_compute),
          Buffer.from(expectedHmac)
        );

      if (!validHmac) {
        console.error("❌ HMAC PayTech invalide");
        return res.status(403).send("Forbidden");
      }

      console.log("✅ IPN authentifiée par HMAC");
    }

    // ===============================
    // VÉRIFICATION SHA256
    // ===============================

    else {
      const expectedApiKeyHash = crypto
        .createHash("sha256")
        .update(apiKey)
        .digest("hex");

      const expectedApiSecretHash = crypto
        .createHash("sha256")
        .update(apiSecret)
        .digest("hex");

      if (
        api_key_sha256 !== expectedApiKeyHash ||
        api_secret_sha256 !== expectedApiSecretHash
      ) {
        console.error("❌ Signature SHA256 PayTech invalide");
        return res.status(403).send("Forbidden");
      }

      console.log("✅ IPN authentifiée par SHA256");
    }

    // ===============================
    // TRAITEMENT DU PAIEMENT
    // ===============================

    console.log("Événement :", type_event);
    console.log("Produit :", item_name);
    console.log("Montant :", item_price);
    console.log("Référence :", ref_command);
    console.log("Token :", token);

    if (type_event === "sale_complete") {
      console.log("💰 PAIEMENT EMB RÉUSSI");
    }

    if (type_event === "sale_canceled") {
      console.log("❌ PAIEMENT EMB ANNULÉ");
    }

    return res.status(200).send("IPN OK");

  } catch (error) {
    console.error("Erreur IPN :", error);

    return res.status(500).send("IPN Error");
  }
});


// ===============================
// RETOUR PAIEMENT RÉUSSI
// ===============================

app.get("/payment/success", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Paiement réussi</title>
      </head>
      <body style="font-family: Arial; text-align:center; padding:40px;">
        <h1>✅ Paiement réussi</h1>
        <p>Merci pour votre commande chez EMB.</p>
        <p>Votre paiement a été reçu.</p>
      </body>
    </html>
  `);
});


// ===============================
// RETOUR PAIEMENT ANNULÉ
// ===============================

app.get("/payment/cancel", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Paiement annulé</title>
      </head>
      <body style="font-family: Arial; text-align:center; padding:40px;">
        <h1>❌ Paiement annulé</h1>
        <p>Le paiement n'a pas été finalisé.</p>
      </body>
    </html>
  `);
});


// ===============================
// DÉMARRAGE DU SERVEUR
// ===============================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EMB backend démarré sur le port ${PORT}`);
});
