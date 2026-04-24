import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // API Route to send election results or Acta PDF
  app.post("/api/send-acta", async (req, res) => {
    const { pdfBase64, oacName } = req.body;
    const targetEmail = "integralessoluciones72@gmail.com";

    console.log(`Intentando enviar acta de ${oacName} a ${targetEmail}`);

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"AsignaCurul Comunal" <${process.env.EMAIL_USER}>`,
          to: targetEmail,
          subject: `ACTA DE ESCRUTINIO - ${oacName || 'OAC'}`,
          text: `Se adjunta el acta de escrutinio generada para la organización: ${oacName || 'N/A'}.`,
          attachments: [
            {
              filename: `Acta_Escrutinio_${(oacName || 'Eleccion').replace(/\s+/g, '_')}.pdf`,
              content: pdfBase64.split("base64,")[1],
              encoding: 'base64'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log("Acta enviada exitosamente por correo.");
        return res.json({ success: true, message: "Acta remitida exitosamente." });
      } else {
        console.warn("Envío de correo omitido: faltan credenciales SMTP.");
        return res.json({ 
          success: true, 
          message: "Acta procesada (Se requiere configurar EMAIL_USER/PASS para envío real)." 
        });
      }
    } catch (error: any) {
      console.error("Error enviando acta:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
