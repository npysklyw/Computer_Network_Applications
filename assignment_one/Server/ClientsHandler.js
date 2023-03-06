
let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');
let net = require('net');
const fs = require('fs');
// You may need to add some delectation here

let sockArr = [];


module.exports = {

    handleClientJoining: function (sock) {
      
        //Get the current timestamp and make a client number
        var currentTime = singleton.getTimestamp();
        var clientNo = "Client - " + currentTime;

        //Print out to server console details regarding a client connect
        console.log(clientNo + " is connected at timestamp: " + currentTime);

        //Push the client specific information to an array
        sockArr.push([sock,clientNo]);
     
        //Handle pass socket and reference to this socket to our socket handler
        handleSocket(sock,sockArr.length -1); 

    }
};

//Socket handler function 
//Called on a per socket basis
function handleSocket(sock,index) {

   //This function is called when the sock object receives data from the client
    sock.on('data', (data) => {
       
        //Print out details of a received packet
        console.log('ITP packet header received:');
        console.log("");
        printPacketBit(data)
        console.log("port" + parseBitPacket(data,36,2))
        console.log("");
        console.log(sockArr[index][1] + ` Requests:
                        -- ITP Version: ` + parseBitPacket(data,0,4) + `
                        -- Timestamp: `+ singleton.getTimestamp() + `
                        -- Request Type: ` + getRequesttoType(parseBitPacket(data,24,8)) +`
                        -- Image file extension(s): ` + getNumbertoType(parseBitPacket(data,64,4)) + `
                        -- Image File name: ` + bytesToString(data.slice(12))
                        

        );
 
        
        //Ensure three things are true in the received packet
        // - The file is in the folder of images
        // - The version number is equal to 7
        // - The response type is of type query
        if (!checkImageName(bytesToString(data.slice(12)),getNumbertoType(parseBitPacket(data,64,4)))) {
          sock.write(ITPpacket.getPacket(2,singleton.getSequenceNumber(),singleton.getTimestamp(),0,0));
        }
        else if (parseBitPacket(data,0,4) != 7|| parseBitPacket(data,24,8) !=1 ) {
          sock.end();
        }
        else {
          sock.write(ITPpacket.getPacket(1,singleton.getSequenceNumber(),singleton.getTimestamp(),bytesToString(data.slice(12)) + "." + getNumbertoType(parseBitPacket(data,64,4)).toLowerCase()));           
        }

        //End the connection
        sock.end();

      });

      //If the client ends the connection, we print this out to the server console
    sock.on('end', function() {

      //Get client information from the array of sockets on the server
      console.log(sockArr[index][1] + " closed the connection");

      //Remove this clinet from the server
      sockArr.splice(sockArr[index], 1);

    })


}

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

//Check if the iamge is in the images folder 
function checkImageName(name,type) {

    //Read directory and store files in an array/Users/nick/Documents/NPYSKLYW-SE3314B-ASSIGNMENT1/Server
    var files = fs.readdirSync('./images');
    let full = name + "." + type.toLowerCase();

    //Check if file is in the directory array
    if (files.includes(full)) {

        return true;
    }
    else {
        return false;
    }

}




// Returns the integer value of the extracted bits fragment for a given packet
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

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
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