var ITPpacket = require("./ITPResponse"),
  singleton = require("./Singleton");
const fs = require("fs");



var nickNames = {},
  clientIP = {},
  startTimestamp = {};

module.exports = {

  handleClientJoining: function (sock) {
    assignClientName(sock, nickNames);

    //clientIP = sock["_peername"].address;
    clientIP = "127.0.0.1";
    clientPort = sock["_peername"].port;

        
      console.log("Connected from peer " +  clientIP + ":" + clientPort);

      //Send a welcome packet to the new peer
      //Set message type equal to one
      //Send the DHT peers in server
      ITPpacket.init(7, 1, getDHTValidPeers() ,singleton.getHostName());
      sock.write(ITPpacket.getBytePacket());
      singleton.pushBucket(singleton.getDHT(),[clientIP,clientPort]);
  
  
    //Push new client to our dht after sending client, order may vary

    //displayDHT();

    //console.log("Timestamp:"  +singleton.getTimestamp())
    //We should likely use this to handle client hello messages
    sock.on("data", function (requestPacket) {
      handleClientRequests(requestPacket, sock); //For client hello messages
    });
    sock.on("close", function () {
      handleClientLeaving(sock);
    });
  },
};

//Display current DHT 
function displayDHT() {
  
    console.log("The dht is equal to:")
    console.log(getDHTValidPeers());
}

//return the DHT for peers that exist
function getDHTValidPeers() {
  let a = singleton.getDHT();
  let n = []

  a.forEach(element => {
    n.push(element)
  });
  return n
}

//We shoudl fix this to receive client hello requests
function handleClientRequests(data, sock) {
  // console.log("\nITP packet received:");
  // printPacketBit(data);
  //Send wlecome

  let version = parseBitPacket(data, 0, 4);
  let requestType = parseBitPacket(data, 4, 8);
  let requestName = {
    1: "Welcome",
    2: "Found",
  };

  let noOfPeers = parseBitPacket(data, 12, 8);
  let sendNameL = parseBitPacket(data, 20, 12);
  let sendName = bytesToString(data.slice(32 + noOfPeers*6));
  //displayDHT();

  if (version == 7) {  
    sock.end();
  } else {
    console.log("The protocol version is not supported");
    sock.end()
  }
}


function handleClientLeaving(sock) {
  //console.log(nickNames[sock.id] + " closed the connection");
  
}

function assignClientName(sock, nickNames) {
  sock.id = sock.remoteAddress + ":" + sock.remotePort;
  startTimestamp[sock.id] = singleton.getTimestamp();
  var name = "Client-" + startTimestamp[sock.id];
  nickNames[sock.id] = name;
  clientIP[sock.id] = sock.remoteAddress;
}

function bytesToString(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

function bytes2number(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result ^= array[array.length - i - 1] << (8 * i);
  }
  return result;
}

// return integer value of a subset bits
function parseBitPacket(packet, offset, length) {
  let number = "";
  for (var i = 0; i < length; i++) {
    // let us get the actual byte position of the offset
    let bytePosition = Math.floor((offset + i) / 8);
    let bitPosition = 7 - ((offset + i) % 8);
    let bit = (packet[bytePosition] >> bitPosition) % 2;
    number = (number << 1) | bit;
  }
  return number;
}
// Prints the entire packet in bits format
function printPacketBit(packet) {
  var bitString = "";

  for (var i = 0; i < packet.length; i++) {
    // To add leading zeros
    var b = "00000000" + packet[i].toString(2);
    // To print 4 bytes per line
    if (i > 0 && i % 4 == 0) bitString += "\n";
    bitString += " " + b.substr(b.length - 8);
  }
  console.log(bitString);
}

//We should use this method to get the peers sent to us
function printPeers(data,nP) {
  let currentcount = 32;
  for (j = 0; j < nP; j++) {
    
    // console.log(parseBitPacket(data, currentcount, 8));
    // console.log(parseBitPacket(data, currentcount + 8, 8));
    // console.log(parseBitPacket(data, currentcount + 16, 8));
    // console.log(parseBitPacket(data, currentcount + 24, 8));

    // console.log(parseBitPacket(data, currentcount + 32, 16));

    let ip = String(parseBitPacket(data, currentcount, 8)) + "." + String(parseBitPacket(data, currentcount + 8, 8)) + "." + String(parseBitPacket(data, currentcount + 16, 8))  + "." + String(parseBitPacket(data, currentcount + 24, 8))  + ":" + String(parseBitPacket(data, currentcount + 32, 16));
    //console.log(ip)
    currentcount = currentcount + 48;

   }
}