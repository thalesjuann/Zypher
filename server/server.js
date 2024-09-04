require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");
const colors = require("colors");

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(colors.green("[BANCO DE DADOS] - Conectado com sucesso"))
  )
  .catch((err) =>
    console.error(colors.red("[BANCO DE DADOS] - Erro ao conectar:", err))
  );

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/assets", express.static(path.join(__dirname, "../assets")));
app.use("/scripts", express.static(path.join(__dirname, "../scripts")));

const routes = require("./routes");
app.use("/", routes);

const server = app.listen(port, () => {
  console.log(colors.cyan(`[SERVIDOR] - Rodando em http://localhost:${port}`));
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log(colors.yellow("[WEB SOCKET] - Nova conexão estabelecida"));

  ws.on("message", (message) => {
    console.log(colors.cyan(`[WEB SOCKET] - Mensagem recebida: ${message}`));
    try {
      const parsedMessage = JSON.parse(message);
      const { username, text } = parsedMessage;

      const chatMessage = { username, text };

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(chatMessage));
        }
      });
    } catch (error) {
      console.error(colors.red("[WEB SOCKET] - Erro ao processar mensagem:", error));
    }
  });

  ws.on("close", () => {
    console.log(colors.magenta("[WEB SOCKET] - Conexão fechada"));
  });

  ws.on("error", (error) => {
    console.error(colors.red("[WEB SOCKET] - Erro no WebSocket:", error));
  });
});
