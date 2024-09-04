const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const path = require("path");
const colors = require("colors");

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

router.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/auth.html"));
});

router.get("/principal", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/principal.html"));
});

router.post("/logar", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.error(colors.red("[AUTENTICAÇÃO] - Email ou senha incorretos"));
      return res.status(400).send("Email ou senha incorretos");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(colors.red("[AUTENTICAÇÃO] - Email ou senha incorretos"));
      return res.status(400).send("Email ou senha incorretos");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    console.log(
      colors.green(`[AUTENTICAÇÃO] - ${user.username} conectado com sucesso`),
    );
    res.redirect("/principal");
  } catch (error) {
    console.error(colors.red("[AUTENTICAÇÃO] - Erro ao fazer login:", error));
    res.status(500).send("Erro ao fazer login");
  }
});

router.post("/cadastro", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log(
      colors.green(`[CADASTRO] - Usuário ${username} cadastrado com sucesso`),
    );
    res.redirect("/principal");
  } catch (error) {
    console.error(colors.red("[CADASTRO] - Erro ao cadastrar usuário:", error));
    res.status(500).send("Erro ao cadastrar usuário");
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  console.log(colors.yellow("[AUTENTICAÇÃO] - Usuário desconectado"));
  res.redirect("/auth");
});

router.get("/api/get-user-info", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.error(colors.red("[AUTENTICAÇÃO] - Usuário não autenticado"));
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error(colors.red("[AUTENTICAÇÃO] - Usuário não encontrado"));
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.log(
      colors.cyan(
        `[API] - Informações do usuário ${user.username} recuperadas com sucesso`,
      ),
    );
    res.json({ username: user.username });
  } catch (error) {
    console.error(colors.red("[API] - Erro ao verificar token:", error));
    res.status(500).json({ error: "Erro no servidor" });
  }
});

module.exports = router;
