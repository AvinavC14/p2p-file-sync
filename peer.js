const { io } = require("socket.io-client");
const fs = require("fs");
const chokidar = require("chokidar");
const wrtc = require("wrtc");
const socket = io("http://localhost:3000");
let peerConnection;
let dataChannel;
socket.emit("join")//tells the server that a new user has joined

 //Manages when new peer joins 
socket.on("peer-joined", async (peerId) => {
  peerConnection = new wrtc.RTCPeerConnection();

  // Create a data channel 
  dataChannel = peerConnection.createDataChannel("chat");
  setupDataChannel();

  // Send ICE candidates to peer
  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("signal", { to: peerId, data: { candidate: e.candidate } });
    }
  }
    // Create and send offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("signal", { to: peerId, data: { offer } });
});

// Handle incoming signal
socket.on("signal", async ({ from, data }) => {
  if (!peerConnection) {
    peerConnection = new wrtc.RTCPeerConnection();

    // Handle receiving data channel
    peerConnection.ondatachannel = (e) => {
      dataChannel = e.channel;
      setupDataChannel();
    };

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", { to: from, data: { candidate: e.candidate } });
      }
    };
  }

  if (data.offer) {
    await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("signal", { to: from, data: { answer } });
  }

  if (data.answer) {
    await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(data.answer));
  }

  if (data.candidate) {
    await peerConnection.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate));
  }
});

function setupDataChannel() {
  dataChannel.onopen = () => {
    console.log("Data channel is open");
    dataChannel.send("Hello peer!");
  };

  dataChannel.onmessage = (e) => {
    console.log("Received:", e.data);
  };
}