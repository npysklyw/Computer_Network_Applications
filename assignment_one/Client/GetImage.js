let net = require("net");
let fs = require("fs");
let open = require("open");
const yargs = require('yargs');

//Path of the client folder/Users/nick/Documents/NPYSKLYW-SE3314B-ASSIGNMENT1/Client
PATH = "./Images/";

let ITPpacket = require("./ITPRequest"); // uncomment this line after you run npm install command

// Enter your code for the client functionality here
//We use yargs to control the client based on the arguments they pass
//We include arguments v,q,s
//Veriion, server, image
const argv = yargs
  .option('server', {
    alias: 's',
    description: 'Current server',
    type: 'string'
  })
  .option('versio', {
    alias: 'v',
    description: 'Version, so we can check',
    type: 'number'
  })
  .option('image', {
    alias: 'q',
    description: 'Name of image you want to access',
    type: 'string'
  })
  .help()
  .alias('help', 'h').argv;


//Get ipp, port from address the user input into the command line
let addr = argv.server.split(":");
let HOST = addr[0],PORT = addr[1];

    
//Create a new client socket
var client = new net.Socket();

//Connect to the given port, and host info
client.connect(Number(PORT), HOST, function() {

    //Write the imagename, and header data to the server
    client.write(ITPpacket.getBytePacket(argv.image,argv.versio));


    //Print connection status on the client
    console.log('Connected to ImageDB server on:' + argv.server);
    console.log("");

    //When the client receives data, handle this
    client.on('data', (data) => {

      //We print out all the information a clinet may want to know
      //Version, response,timestamp
      //We access the packets specific header field locations
      console.log('ITP packet header received:');
      printPacketBit(data)
      console.log("");
      console.log(`Server Sent:
                      -- ITP Version = ` + parseBitPacket(data,0,4) + `
                      -- Response Type = `+ getRequesttoType(parseBitPacket(data,4,8)) + `
                      -- Sequence Header = ` + parseBitPacket(data,12,20) +`
                      -- Timestamp = ` + parseBitPacket(data,32,32)
      );
      
      //Record the reponse type of the packet
      let response = parseBitPacket(data,4,8);

      //We check response type, ensure that we the image requested was sent to the client
      //If it was, we display it
      if (response != 2) {

        //Get all data after index 12 in the buffer
        let im = data.slice(12);

        //Write the file to the client system
        fs.writeFile(PATH+ argv.image, new Buffer(im, "base64"), function (err) {
          if(err)   console.log(err);
          
          //We open up the default picture viewer
          asyncCall()
        });
 
      }

     
      

      
      
   
    })
client.on('end', function() {

        //Get client information from the array of sockets on the server
        console.log("Disconnected from server");
        console.log("Connection closed");
  
      })
    //
    

    
    
})

//Open iamge viewer
async function asyncCall() {
  //This will open the imagepath given with the default picture viewer
  await open(PATH+ argv.image, {wait: true});
}
//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.


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

  //Convert the request type to the textual description
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
