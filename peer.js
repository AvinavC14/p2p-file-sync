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

    //using chokidar to watch the send files 
    chokidar.watch("./upload").on('all',(event,path)=>{
      if(event === 'add' || event === 'change') {
        const fileMetadata = fs.statSync(path)
        const file=fs.readFileSync(path)
    console.log(` ${event} occured at  ${path} `);
        dataChannel.send(JSON.stringify({
          type: 'fileMetadata',
          event: event,
          filePath: path,
          size: fileMetadata.size,
          uploadedAt: fileMetadata.birthtime
        }));
      
        dataChannel.send(file);
      } else if (event === 'unlink') {  
        dataChannel.send(JSON.stringify({
          type: 'fileDeleted',
          filePath: path
        }));
      }})
  };

 dataChannel.onmessage = (e) => {
  if (typeof e.data === 'string') {
    const msg = JSON.parse(e.data);

    if (msg.type === 'fileMetadata') {
      receivedFileMetadata = msg;
      receivedBuffers = [];
    }
    else if (msg.type === 'fileDeleted') {
      const deletePath = path.join("upload", path.basename(msg.filePath));
      fs.unlink(deletePath, () => {});
    }

  } else if (e.data instanceof ArrayBuffer) {
    receivedBuffers.push(Buffer.from(e.data));

    if (receivedFileMetadata) {
      const outputPath = path.join("upload", path.basename(receivedFileMetadata.filePath));
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, Buffer.concat(receivedBuffers));
      console.log(`Saved synced file to: ${outputPath}`);

      receivedFileMetadata = null;
      receivedBuffers = [];
    }
  }
};

}