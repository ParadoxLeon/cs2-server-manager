// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { Rcon } = require("rcon-client");
const fs = require("fs");

// Configuration
const CONFIG = {
    rconHost: "127.0.0.1", // Change to server IP
    rconPort: 27015, // Default CS2 RCON port
    rconPassword: "passwd", // RCON password
    webPort: 3136, // Port for web server
    workshopFile: "workshop_maps.json",
};

// Initialize Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Basic authentication
const authMiddleware = (req, res, next) => {
    const auth = { username: "admin", password: "admin" }; // Change these credentials
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [login, pwd] = Buffer.from(b64auth, "base64").toString().split(":");
    if (login && pwd && login === auth.username && pwd === auth.password) {
        return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="CS2 Manager"');
    return res.status(401).send("Authentication required.");
};
app.use(authMiddleware);

// Load workshop maps
const loadWorkshopMaps = () => {
    try {
        const data = fs.readFileSync(CONFIG.workshopFile, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error loading workshop maps:", err);
        return [];
    }
};

// RCON Command Function
const sendRconCommand = async (command) => {
    const rcon = new Rcon({
        host: CONFIG.rconHost,
        port: CONFIG.rconPort,
        password: CONFIG.rconPassword,
    });
    try {
        await rcon.connect();
        const response = await rcon.send(command);
        await rcon.end();
        return response;
    } catch (err) {
        console.error("RCON Error:", err);
        return `Error: ${err.message}`;
    }
};

// Routes
app.post("/change-map", async (req, res) => {
    const map = req.body.map;
    const command = `changelevel ${map}`;
    const response = await sendRconCommand(command);
    res.redirect(`/?message=Command executed: ${command} - ${response}`);
});

app.post("/change-workshop-map", async (req, res) => {
    const workshopId = req.body.workshopId;
    const command = `ds_workshop_changelevel ${workshopId}`;
    const response = await sendRconCommand(command);
    res.redirect(`/?message=Command executed: ${command} - ${response}`);
});

app.post("/send-command", async (req, res) => {
    const command = req.body.command;
    const response = await sendRconCommand(command);
    res.redirect(`/?message=Command executed: ${command} - ${response}`);
});

app.get("/", (req, res) => {
    const workshopMaps = loadWorkshopMaps();
    const workshopOptions = workshopMaps
        .map((map) => `<option value="${map}">${map}</option>`)
        .join("");
    const message = req.query.message || ""; // Fetch message from query string
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CS2 Server Manager</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #121212;
                  color: #eee;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  flex-direction: column;
                  position: relative;
              }
              h1 {
                  color: #4CAF50;
                  margin-bottom: 20px;
              }
              form {
                  background-color: #333;
                  padding: 20px;
                  margin: 10px;
                  border-radius: 8px;
                  width: 350px;
                  text-align: center;
              }
              form h3 {
                  margin-top: 0;
                  margin-bottom: 10px;
              }
              button, input, select {
                  padding: 10px;
                  margin-top: 10px;
                  width: 100%;
                  border: none;
                  border-radius: 5px;
                  background-color: #4e479d;
                  color: white;
                  font-size: 16px;
                  box-sizing: border-box;
              }
              button:hover {
                  background-color: #9171f8;
              }
              input, select {
                  margin-top: 10px;
              }
              .container {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
              }
              /* Floating GitHub Icon */
              .github-icon {
                  position: fixed;
                  bottom: 20px;
                  left: 20px;
                  font-size: 40px;
                  color: white;
                  background-color: #333;
                  padding: 10px;
                  border-radius: 50%;
                  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
                  transition: background-color 0.3s ease;
              }
              .github-icon:hover {
                  background-color: #6cc644;
                  color: white;
              }
              /* Notification */
              .notification {
                  position: absolute;
                  top: 20px;
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  border-radius: 5px;
                  font-size: 16px;
                  z-index: 9999;
                  animation: slideIn 2s ease-out;
                  transition: opacity 1s ease-out;
              }
              @keyframes slideIn {
                  from {
                      top: -100px;
                      opacity: 0;
                  }
                  to {
                      top: 20px;
                      opacity: 1;
                  }
              }
          </style>
      </head>
      <body>
          <!-- Display the notification -->
          ${message ? `<div class="notification">${message}</div>` : ""}

          <div class="container">
              <h1>CS2 Server Manager</h1>
              <form action="/change-map" method="POST">
                  <h3>Change Local Map</h3>
                  <input type="text" name="map" placeholder="Map name (de_dust2)" required />
                  <button type="submit">Change Map</button>
              </form>
              <form action="/change-workshop-map" method="POST">
                  <h3>Change Workshop Map</h3>
                  <select name="workshopId" required>
                      ${workshopOptions}
                  </select>
                  <button type="submit">Change Workshop Map</button>
              </form>
              <form action="/send-command" method="POST">
                  <h3>Quick Commands</h3>
                  <button type="submit" name="command" value="mp_restartgame 1">Restart Game</button>
              </form>
              <form action="/send-command" method="POST">
                  <h3>Send Custom Command</h3>
                  <input type="text" name="command" placeholder="Enter console command" required />
                  <button type="submit">Send Command</button>
              </form>
          </div>

          <!-- GitHub -->
          <a href="https://github.com/ParadoxLeon/cs2-server-manager" target="_blank" class="github-icon">
              <i class="fab fa-github"></i>
          </a>

          <script>
              // Check if notification exists
              const notification = document.querySelector('.notification');
              if (notification) {
                  // Fade out notification after 10 seconds
                  setTimeout(() => {
                      notification.style.opacity = '0';
                      setTimeout(() => {
                          notification.style.display = 'none';
                      }, 1000); // Allow time for fade-out
                  }, 10000); // Wait for 10 seconds
              }
          </script>
      </body>
      </html>
    `);
});

// Start the web server
app.listen(CONFIG.webPort, () => {
    console.log(`Web manager running at http://localhost:${CONFIG.webPort}`);
});
