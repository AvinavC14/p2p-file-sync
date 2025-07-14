# 📁 P2P File Sync App

A simple **peer-to-peer (P2P)** file synchronization system built using **Node.js**, **WebRTC**, and **Socket.IO**. This tool enables real-time file syncing between two devices over the internet or local network without relying on any third-party cloud storage.



---

## 🚀 Features

- 📡 Real-time file synchronization between peers
- 🔗 Peer discovery and signaling using **Socket.IO**
- 🔐 Direct peer-to-peer connection using **WebRTC**
- 🕵️‍♂️ Uses **STUN** servers to discover public IP addresses
- 📂 Watches file changes using **Chokidar**
- 🔁 Syncs newly created, modified, and deleted files
- 📱 Works on mobile (e.g., Termux) and desktop

---

## 🛠️ Technologies Used

- [Node.js](https://nodejs.org/)
- [Socket.IO](https://socket.io/)
- [WebRTC](https://webrtc.org/)
- [Chokidar](https://github.com/paulmillr/chokidar) – for file watching
- [wrtc](https://github.com/node-webrtc/node-webrtc) – WebRTC for Node.js

---

## 📂 Project Structure

```bash
file-sync/
├── node_modules/         # Dependencies
├── upload/               # Uploaded/synced files
├── .gitignore
├── index.html            # Frontend HTML file
├── package.json
├── package-lock.json
├── peer.js               # peer logic
├── script.js             # Frontend WebRTC + file sync logic
├── server.js             # Socket.IO signaling server
└── README.md


```

## ⚙️ How It Works

1. One peer opens the app and connects to the signaling server.
2. Another peer joins using the same signaling room.
3. Socket.IO is used for signaling to exchange WebRTC connection data (SDP, ICE candidates).
4. Once WebRTC connection is established, a **DataChannel** is created between peers.
5. File changes are tracked using **Chokidar** and sent over the DataChannel.
6. Received files are saved in the peer’s sync folder.

---

## 🧪 Requirements

- Node.js v16+
- npm or yarn
- STUN servers (Google STUN used by default)

---

## 🖥️ Installation

```bash
git clone https://github.com/your-username/p2p-file-sync.git
cd p2p-file-sync
npm install
```
## 🧑‍💻 Running the Project
- Start the Signaling Server
```bash
npm run start
```
- This will start a Socket.IO server on http://localhost:3000.

- Start Peer A and Peer B (on different terminals or devices)
```bash
node peer.js
```
- Once both peers are connected to the same room, file syncing will begin automatically.

## 🧠 Concepts Involved
- WebRTC: For establishing P2P communication via ICE candidates, STUN/TURN, and SDP offers.

- Socket.IO: Used as a signaling mechanism for peer discovery and handshake.

- Chokidar: Watches for file additions, changes, and deletions in real time.

