# CS2 Server Manager

CS2 Server Manager is a web-based management tool for your Counter-Strike 2 (CS2) server. This tool allows you to easily control your server settings, change local and workshop maps, and send custom console commands directly from your browser.

## Features

- **Change Local Map**: Easily switch between local maps.
- **Change Workshop Map**: Switch to a map from your Steam Workshop collection.
- **Quick Commands**: [Wiki](https://github.com/ParadoxLeon/cs2-server-manager/wiki/Quick-Commands)
- **Send Custom Commands**: Execute any console command on your server.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/cs2-server-manager.git
    ```
2. Install the required dependencies:

   Install NodeJS ([nodesource](https://github.com/nodesource/distributions?tab=readme-ov-file#table-of-contents))

    ```bash
    npm install express body-parser rcon-client
    ```
4. Configure the server settings in `config.js` (update RCON credentials and server IP).
5. Run the application:
   ```bash
    node cs2manager.js
   ```
6. Access the web interface via `http://localhost:3136`.

## Example systemd service unit file
```
[Unit]
Description=CS2Manager
After=network.target

[Service]
WorkingDirectory=/var/www/cs2manager
ExecStart=/usr/bin/node cs2manager.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
