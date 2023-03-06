let net = require("net");
let ITPpacket = require("./ITPRequest"),
  singleton = require("./Singleton");

//Initialize singleton class
module.exports = {

  clientRun: function(PORT,HOST,hostName) {
    singleton.init(hostName);

    //Create a new client socket
    let client = new net.Socket();

    //Used to store ip address and port
    //let thisIP,thisPort;

    //Connect to the server specified
    TEMP = gethostnametoport(hostName)
    
    client.connect({port:Number(PORT),host:HOST,localPort:TEMP}, function () {
      singleton.setServer(PORT);
      //Set port, ip to track for later
      //thisPort= client.address()["port"];client.address()["port"]
      //thisIP = client.address()["address"];
      singleton.setIPPort(client.address()["address"],TEMP);
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
          
          
          
          let version = parseBitPacket(data, 0, 4);
          let requestType = parseBitPacket(data, 4, 8);
          
          if(requestType == 2) {
            console.log("Received Hello Packet from " + sock.remotePort);
            let noOfPeers = parseBitPacket(data, 12, 8);
            let sendNameL = parseBitPacket(data, 20, 12);
            let sendName = bytesToString(data.slice(32 + noOfPeers*6));
            console.log("Refresh k-Bucket operation is performed. ");
            console.log("Refresh k-Bucket operation is performed. ");
            refreshBucket(singleton.getDHT(),parseIncomingDHT(data,noOfPeers));

            console.log("My DHT: ");
            displayDHT();
            sock.end();
          }
          else if(requestType == 3) {

            //In cases of a response type 3
           

            let senderNameSize = parseBitPacket(data, 20, 12);
            let senderName = bytesToString(data.slice(4,senderNameSize + 4 ));
            let port = parseBitPacket(data, 104, 16);
            console.log("Received a kadPTP seearch request from:" + senderName);
            let currentBit = senderNameSize*8 + 32;

            let ip = String(parseBitPacket(data, currentBit, 8)) + "." + String(parseBitPacket(data, currentBit +8, 8)) + "." + String(parseBitPacket(data, currentBit+16, 8))  + "." + String(parseBitPacket(data, currentBit + 24, 8))  + ":" + String(parseBitPacket(data, 104, 16));
           

            currentBit = currentBit + 48;
            let type = parseBitPacket(data, currentBit, 4);
            currentBit = currentBit + 4;
            let imageFileSize = parseBitPacket(data, currentBit, 28);
            currentBit = currentBit + 28;
            let imageName = bytesToString(data.slice(currentBit/8,(currentBit/8) +imageFileSize));
           // let imageName = bytesToString(data.slice(144));


            file = imageName + "." + getNumbertoType(type).toLowerCase();

     //       console.log("Is the image" + imageName + " on machine? " + checkLKL(imageName))
            if (checkLKL(imageName)) {
              // sock.write(ITPpacket.getImagePacket(2,singleton.getSequenceNumber(),singleton.getTimestamp(),0,0));
              sock.write(ITPpacket.getImagePacket(4,456,433,file));
             }
             else {
              if (getSize(singleton.getDHT()) != 0) { //check if dht

                let p,ip;
    
                let v= getclosestPeer(imageName + "." + getNumbertoType(type).toLowerCase(),sock.remotePort)
                ip = String(v[0])
                p = Number(v[1])
                
                let im, size;
                let searchSocket = new net.Socket();
                searchSocket.connect({port:p,host:ip}, function () {    

                    console.log("Sending Search Packet")
                    searchSocket.write(ITPpacket.getSearchPacket(file, 7, singleton.getHostName(),String(singleton.getIP()),String(singleton.getPort())));
      
                    searchSocket.on('data', (data) => {
                      //Received image
                      
                      console.log("ITP packet response received to forward the image to the client")
                       im = data.slice(12);
                      size =  parseBitPacket(data,64,32)
                      sock.write(ITPpacket.getImageFriend(554,444,im,size), () => {
                        sock.end();
                        searchSocket.end();
                      })
                      
      
                    })
                    //Wait for image to be received
                    
                });
               }
             }
            
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
      helloSocket.connect({port:currentEPort,host:currentEIP,localPort:singleton.getPort()}, function () {
        let a = singleton.getDHT();
        let n = []
    
        a.forEach(element => {
          
          n.push(element)
          
        });
  
        n.push([singleton.getIP(),singleton.getPort()])
        ITPpacket.init(7, 2, n,singleton.getHostName());
        helloSocket.write(ITPpacket.getBytePacket());
      //  helloSocket.end();
      
      })
    }
    
    
    

  });
   
}

function checkLKL(filename) {
  let current = singleton.getLKL();
  // current.forEach(element => {
  //     console.log(element[1])
  //     if (element[1].split(".")[0] == filename) {
  //       return true;
  //     }
  // });
  if (current[1].split(".")[0] == filename) {
          return true;
        }
  return false;
}

function getImageTypeToNumber(name) {

  let ext = name.split('.').pop();
  ext = ext.toUpperCase();
  if (ext == "BMP") {
    return 1;
  }
  else if (ext === "JPEG") {
    return 2;
  }
  else if (ext === "GIF") {
    return 3;
  }
  else if (ext === "PNG") {
    return 4;
  }
  else if (ext === "TIFF") {
    return 5;
  }
  else if (ext ==="RAW") {
    return 15;
  }
}

//Convert extension of file to numbers
function getNumbertoType(num) {


  if (num == 1) {
    return "BMP";
  }
  else if (num == 2) {
    return "JPEG";
  }
  else if (num == 3) {
    return "GIF";
  }
  else if (num == 4) {
    return "PNG";
  }
  else if (num ==5) {
    return "TIFF";
  }
  else if (num ==15) {
    return "RAW";
  }
}

function gethostnametoport(hostname) {

  if (hostname == "peer1") {
    return 2001;
  }
  else if (hostname == "peer2") {
    return 2055;
  }
  else if (hostname == "peer3") {
    return 2077;
  }
  else if (hostname == "peer4") {
    return 2044;
  }
  else if (hostname == "peer5") {
    return 2005;
  }

}

function getSize(d) {
  let count = 0;
  d.forEach(element => {
      count = count + 1;
  });

  return count;
}

function getclosestPeer(rq,r) {
  dht = singleton.getDHT()
  key = singleton.Hex2Bin(singleton.getKeyID(rq));

  max = -1
  let closest;
  dht.forEach(element => {
    console.log(r)
    if (singleton.getLeft(singleton.Hex2Bin(element[2]),key) > max && (singleton.getID() != element[2]) && (element[1] != singleton.getServer()) && (element[1] != r)) {
      closest = element
    }
  });

  console.log(closest)
  return closest

}