let net = require("net");
let ITPpacket = require("./ITPRequest"),
  singleton = require("./Singleton");




//Get server port host as argument
// let hostserverIPandPort = process.argv[3].split(":");
// let PORT = hostserverIPandPort[1];
// let HOST = hostserverIPandPort[0];

//Initialize singleton class
module.exports = {

  clientRun: function(PORT,HOST,hostName) {
    singleton.init(hostName);

    //Create a new client socket
    let client = new net.Socket();

    //Used to store ip address and port
    //let thisIP,thisPort;

    //Connect to the server specified

    
    client.connect(Number(PORT),HOST, function () {
      singleton.setServer(PORT);
      //Set port, ip to track for later
      //thisPort= client.address()["port"];
      //thisIP = client.address()["address"];
      singleton.setIPPort(client.address()["address"],client.address()["port"]);
      //When a welcome message received from the server
      client.on('data', (data) => {
      
        let version = parseBitPacket(data, 0, 4);
        let requestType = parseBitPacket(data, 4, 8);
        let noOfPeers = parseBitPacket(data, 12, 8);
        let sendNameL = parseBitPacket(data, 20, 12);
        let sendName = bytesToString(data.slice(32 + noOfPeers*6));

        //Ensure request is type welcome
        if (requestType == 1) {

          //Connected to message
          console.log("Connected to " + sendName + ":" + client.remotePort + " at timestamp " + singleton.getTimestamp());

          //Print out our peer address
          console.log("This peer address is " + singleton.getIP() + ":" + singleton.getPort() + "  located at " + singleton.getHostName() + " " + singleton.getID());

          //Denote welcome message from the server
          console.log(`Received Welcome message from ` + sendName + `
            along with DHT: ` 
          );

          //Print the dht
          displayIncomgingDHT(parseIncomingDHT(data,noOfPeers))

          //Push server details to DHT here, perhaps do this after 
          
          singleton.pushBucket(singleton.getDHT(),["127.0.0.1",client.remotePort])


          //Refresh the buckets
          //displayDHT();
          console.log("");
          console.log("Refresh k-Bucket operation is performed. ");
          console.log("");
          refreshBucket(singleton.getDHT(),parseIncomingDHT(data,noOfPeers));
          //singleton.pushBucket(singleton.getDHT(),["127.0.0.1",3000]);
          
          console.log("My DHT: ");

          displayDHT();
          //Send the Hello packet to all clients in the DHT
          sendHello(singleton.getDHT());
          console.log("");
          console.log("Hello packet has been sent.");
          console.log("");

     
        }
    
        client.end();
        
      })


    });


    client.on("pause", () => {
      console.log("pause");
    });
    client.on("end", () => {

        //Create the server here, for now)
      let Server_KADpeer = net.createServer();
      Server_KADpeer.listen(singleton.getPort(),singleton.getIP());

      Server_KADpeer.on('connection', function(sock) {

        sock.on('data', function(data) {
          
          
          console.log("Received Hello Packet from " + sock.remotePort);
          let version = parseBitPacket(data, 0, 4);
          let requestType = parseBitPacket(data, 4, 8);
          
          if(requestType === 2) {
            let noOfPeers = parseBitPacket(data, 12, 8);
            let sendNameL = parseBitPacket(data, 20, 12);
            let sendName = bytesToString(data.slice(32 + noOfPeers*6));

            console.log("Refresh k-Bucket operation is performed. ");
            refreshBucket(singleton.getDHT(),parseIncomingDHT(data,noOfPeers));

            console.log("My DHT: ");
            displayDHT();
          }
        
          
        });
      });
      
      client.end();
      
    });

    // Add a 'close' event handler for the client socket
    client.on("close", function () {
      //console.log("Connection closed");
    
    });

    client.on("end", () => {
      //console.log("Disconnected from the server");
      
    });
  }
}
// return integer value of the extracted bits fragment
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
function bytes2string(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}



function displayDHT() {
  let b = singleton.getDHT();


    b.forEach(element => {
      console.log(element)
    });
}

function displayIncomgingDHT(D) {
  let b = D;


    b.forEach(element => {
      console.log(element)
    });
}
 
function parseIncomingDHT(data,nP) {

  //Use this to get bit position
  let currentcount = 32;

  //Collect the DHT incoming
  incomingDHTStore = [];

  //Parse the incoming data append to the array
  for (j = 0; j < nP; j++) {

    //Parse the 48 bits of ip and port
    let ip = String(parseBitPacket(data, currentcount, 8)) + "." + String(parseBitPacket(data, currentcount + 8, 8)) + "." + String(parseBitPacket(data, currentcount + 16, 8))  + "." + String(parseBitPacket(data, currentcount + 24, 8))  + ":" + String(parseBitPacket(data, currentcount + 32, 16));

    //Push the parsed data to the array in correct format may wanna correct this
    incomingDHTStore.push([ip.split(':')[0],Number(ip.split(':')[1]),singleton.getPeerID(ip.split(':')[0],ip.split(':')[1])]);

    //Increment the counter here
    currentcount = currentcount + 48;

   }

   return incomingDHTStore;

}

function bytesToString(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}


//Refresh k buckets
function refreshBucket(d,t) {

  //Reduce list to simply just items
  let reducedList = [].concat.apply([], d);

  //Iterate through dht
   t.forEach(element => {
       let peerID = singleton.getPeerID(element[0],element[1]);
       //Only push peerId if it isn't there currentlypeerID != singleton.getID()
       if(!reducedList.includes(peerID)) {
           singleton.pushBucket(singleton.getDHT(),[element[0],element[1]])
       }
   });
}

//Send Hello packets to all peers
function sendHello(t) {
  //Go through list of all peers
  //For each peer in the DHT send a Hello which has our DHT
  t.forEach(element => {

    //console.log("Trying to connect to " + element[0] + ":" + element[1]);

    //Not necessary will remove
    //Create new Hello Socket
    let helloSocket = new net.Socket();

    //Connect to each element 
    let currentEPort = element[1];
    let currentEIP = element[0];

    if (currentEPort != singleton.getServer()){
      helloSocket.connect(currentEPort, currentEIP, function () {
        let a = singleton.getDHT();
        let n = []
    
        a.forEach(element => {
          
          n.push(element)
          
        });
  
        n.push([singleton.getIP(),singleton.getPort()])
        ITPpacket.init(7, 2, n,singleton.getHostName());
        helloSocket.write(ITPpacket.getBytePacket());
        helloSocket.end();
      
      })
    }
    
    
    

  });
   
}