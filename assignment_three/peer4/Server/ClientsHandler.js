var ITPpacket = require("./ITPResponse"),
  singleton = require("./Singleton");
const fs = require('fs');
let net = require("net");

let sockArr = [];
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

  handleImageClientJoining: function (sock) {
      
    //Get the current timestamp and make a client number
    var currentTime = singleton.getTimestamp();
    var clientNo = "Client - " + currentTime;

    //Print out to server console details regarding a client connect
    console.log(clientNo + " is connected at timestamp: " + currentTime);

    //Push the client specific information to an array
    sockArr.push([sock,clientNo]);
 
    //Handle pass socket and reference to this socket to our socket handler
    handleImageSocket(sock,sockArr.length -1); 

}
};

//Socket handler function 
//Called on a per socket basis
function handleImageSocket(sock,index) {

  //This function is called when the sock object receives data from the client
   sock.on('data', (data) => {
      
       //Print out details of a received packet
       console.log('ITP packet header received:');
       console.log("");
       printPacketBit(data)
       console.log("");
       console.log(sockArr[index][1] + ` Requests:
                       -- ITP Version: ` + parseBitPacket(data,0,4) + `
                       -- Timestamp: `+ singleton.getTimestamp() + `
                       -- Request Type: ` + getRequesttoType(parseBitPacket(data,24,8)) +`
                       -- Image file extension(s): ` + getNumbertoType(parseBitPacket(data,64,4)) + `
                       -- Image File name: ` + bytesToString(data.slice(12))
                       

       );

      //  if (checkLKL(bytesToString(data.slice(12)),getNumbertoType(parseBitPacket(data,64,4)))) {
      //    console.log("found")
      //  }
      let file = String(bytesToString(data.slice(12)) + "." + getNumbertoType(parseBitPacket(data,64,4)));

       
       //Ensure three things are true in the received packet
       // - The file is in the folder of images
       // - The version number is equal to 7
       // - The response type is of type query
       

      //  if (!checkImageName(bytesToString(data.slice(12)),getNumbertoType(parseBitPacket(data,64,4)))) {
      //    sock.write(ITPpacket.getImagePacket(2,singleton.getSequenceNumber(),singleton.getTimestamp(),0,0));
      //  }

      //cHECK LOCAL Keys to see if the IMAGE is in the lkl, if we cannot find the image try to send query
        if (checkLKL(bytesToString(data.slice(12)),getNumbertoType(parseBitPacket(data,64,4)))) {
        // sock.write(ITPpacket.getImagePacket(2,singleton.getSequenceNumber(),singleton.getTimestamp(),0,0));
        sock.write(ITPpacket.getImagePacket(1,singleton.getSequenceNumber(),singleton.getTimestamp(),bytesToString(data.slice(12)) + "." + getNumbertoType(parseBitPacket(data,64,4)).toLowerCase()));
       }
       else {
        if (getSize(singleton.getDHT()) != 0) { //check if dht
          //GET closest DHT - worry later
  
          //ATM lets send to first
  
          let d = singleton.getDHT();
    
          // d.forEach(element => {
          //   getSearchPacket(imageName,version);
          //   return true;
          // });
          let p,ip;
  
          for (let i=0; i < 160; i++) {
  
            if (typeof d[i] != 'undefined') {
  
              ip = d[i][0];
              p = d[i][1];
              break
            }
          
          }
          
          let im, size;
          let helloSocket = new net.Socket();
  
          helloSocket.connect(p, ip, function () {    
              helloSocket.write(ITPpacket.getSearchPacket(file, 7, singleton.getHostName(),"127.0.0.1","3000"));

              helloSocket.on('data', (data) => {
                //Received image

                console.log("ITP packet response received to froward the image to the client")
                 im = data.slice(12);
                size =  parseBitPacket(data,64,32)
                sock.write(ITPpacket.getImageFriend(554,444,im,size))
                

              })
              //Wait for image to be received
             // helloSocket.end();
          });

          

          //Find closest peer in KAD network, analyze DHT, look for closest peer, then this peer checks to see if they have this image
          //If they do not check 
          //If they do however they will receive the image from them abd then send this to client
         }
       }
      //  else if (getSize(singleton.getDHT()) != 0) { //check if dht
      //   //GET closest DHT - worry later

      //   //ATM lets send to first

      //   let d = singleton.getDHT();
      //   console.log("not empty")
      //   // d.forEach(element => {
      //   //   getSearchPacket(imageName,version);
      //   //   return true;
      //   // });
       

      //   //Find closest peer in KAD network, analyze DHT, look for closest peer, then this peer checks to see if they have this image
      //   //If they do not check 
      //   //If they do however they will receive the image from them abd then send this to client
      //  }

      //  else if (parseBitPacket(data,0,4) != 7|| parseBitPacket(data,24,8) !=1 ) {
      //    sock.end();
      //  }
      //  else {
      //    sock.write(ITPpacket.getImagePacket(1,singleton.getSequenceNumber(),singleton.getTimestamp(),bytesToString(data.slice(12)) + "." + getNumbertoType(parseBitPacket(data,64,4)).toLowerCase()));           
      //  }

       

       //End the connection
      // sock.end();

     });

     //If the client ends the connection, we print this out to the server console
   sock.on('end', function() {

     //Get client information from the array of sockets on the server
     console.log(sockArr[index][1] + " closed the connection");

     //Remove this clinet from the server
     sockArr.splice(sockArr[index], 1);

   })


}

function getSize(d) {
  let count = 0;
  d.forEach(element => {
      count = count + 1;
  });

  return count;
}
//Check if the iamge is in the images folder 
function checkImageName(name,type) {

  //Read directory and store files in an array/Users/nick/Documents/NPYSKLYW-SE3314B-ASSIGNMENT1/Server
  var files = fs.readdirSync('/Users/nick/Documents/School/3314/Assignments/npysklyw-SE3314b-assignment3/peer1/Server/images');
  let full = name + "." + type.toLowerCase();

  //Check if file is in the directory array
  if (files.includes(full)) {

      return true;
  }
  else {
      return false;
  }

}

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

    let ip = String(parseBitPacket(data, currentcount, 8)) + "." + String(parseBitPacket(data, currentcount + 8, 8)) + "." + String(parseBitPacket(data, currentcount + 16, 8))  + "." + String(parseBitPacket(data, currentcount + 24, 8))  + ":" + String(parseBitPacket(data, currentcount + 32, 16));
    currentcount = currentcount + 48;

   }
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

//Set request numbers to messages 
function getRequesttoType(num) {


if (num == 0) {
  return "Query";
}
else if (num == 1) {
  return "Found";
}
else if (num == 2) {
  return "Not found";
}
else if (num == 3) {
  return "Busy";
}

}