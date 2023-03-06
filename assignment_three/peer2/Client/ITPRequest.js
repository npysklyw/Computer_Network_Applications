const fs = require('fs');

IMAGE_PATH = "/Users/nick/Documents/School/3314/Assignments/npysklyw-SE3314b-assignment3/peer2/Client/"

let noP;
//Fields that compose the ITP header
let version;

module.exports = {
  responseHeader: "", //Bitstream of the request packet
  payloadSize: 0, //size of the ITP payload

  payload: "", //Bitstream of the ITP payload

  init: function (
    ver, // ITP version
    resType, // response type
    dhttable, // image data
    senderName,
  ) {


    //fill out the header array of byte with ITP header fields

    let noOfPeers = dhttable.length;
    noP = noOfPeers;
    this.responseHeader = new Buffer.alloc(32 + noOfPeers*48);
    let senderNameL =  byteCount(senderName);

    // version 4 bit
   // console.log("4bit")
    storeBitPacket(this.responseHeader, 7, 0, 4);
    //message type, 1 means welcome 8 bit
    //console.log("res")
    storeBitPacket(this.responseHeader, resType, 4, 8);

    //number of peers holds number of peers in dht table, sent before new peer is added 8 bit
    //console.log("pp")
    storeBitPacket(this.responseHeader, noOfPeers, 12, 8);
    //sender name length in bytes - 12 bit
    //console.log("namel")
    storeBitPacket(this.responseHeader, senderNameL, 20, 12);
    //add senderName for whatever length 

    this.payloadSize = senderNameL;
    this.payload = new Buffer.alloc(this.payloadSize );
    let senderNameS = stringToBytes(senderName);
    // image file name
    for (j = 0; j < senderNameL; j++) {
      this.payload[j] = senderNameS[j];
    } 
   
    let currentcount = 32;
    
    if (noOfPeers != 0) {
      for (j = 0; j < noOfPeers; j++) {
  
        if (dhttable[j] !== "undefined") {
          let currentPeer = dhttable[j];//get specifc peer
          let ip = currentPeer[0].split('.');
          
          
          ip.forEach(element => {
           // console.log(element)
            storeBitPacket(this.responseHeader, Number(element), currentcount, 8);
            currentcount = currentcount + 8;
    
          });
          // storeBitPacket(this.responseHeader, Number(ip[0]), 32, 8);
          //storeBitPacket(this.responseHeader, Number(ip[1]), 40, 8);
    
          //storeBitPacket(this.responseHeader, Number(ip[2]), 48, 8);
          //storeBitPacket(this.responseHeader, Number(ip[3]), 56, 8);
          //console.log(Number(currentPeer[1]))
          storeBitPacket(this.responseHeader, Number(currentPeer[1]), currentcount, 16);
          currentcount = currentcount+ 16;
      }
       }
    }

  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    let packet = new Buffer.alloc(this.payload.length + 32 + noP*48);
    //construct the packet = header + payload
    for (var Hi = 0; Hi < (32 + 2*48); Hi++) packet[Hi] = this.responseHeader[Hi];
    for (var Pi = 0; Pi < this.payload.length; Pi++)
      packet[Pi + (32 + noP*48)] = this.payload[Pi];

    return packet;
  },
  getSearchPacket: function (imageName,version,name,originalIP,originalPort) {
    // enter your code here

    //Get remove extension
    letNoExt = imageName.split(".")[0];
    let noextsize =  byteCount(letNoExt);
    let senderNameLength = byteCount(name);
    //Create a packet
    packet = new Buffer.alloc(14 + senderNameLength + noextsize);
    
    

    //Formulate the packet
    storeBitPacket(packet,version,0,4); //version
    storeBitPacket(packet,3,4,8); //type 3 is earch
    storeBitPacket(packet,0,12,8);//reserved 
    storeBitPacket(packet,senderNameLength,20,12); //sender name length

    //packet is now 32 bits long
    //next add the sender name
    console.log(senderNameLength);

    let nameBytes = stringToBytes(name); //Converting file name to bytes
    //Create buffer
    let buffer = new Buffer.alloc(senderNameLength); //32 bytes allocated for sendername, we ca test various lengths perhaps

    console.log(name)
    //Loops over length of filename string, copied filename string to bitstream
    for(var i = 0; i < senderNameLength; i++){
      //Copying file name to bitstream
      buffer[i] = nameBytes[i];
      packet[i+4] = buffer[i]
    }

    //136
    //Addition of name brings size to 136bits

    //add ip for 32 bits

    //Store IP as packet
    let ip = originalIP.split('.'); //ip address given as string
    
    let currentcount =senderNameLength*8 + 32;
    //let currentcount =;
    ip.forEach(element => {
      // console.log(element)
      storeBitPacket(packet, Number(element), currentcount, 8);
      currentcount = currentcount + 8;

    });



    //Now we ip onto there(), so now we must add port(16bits) +96 
    let port = originalPort;
    //Store port as packet
    storeBitPacket(packet, Number(port), currentcount, 16);  

    currentcount = currentcount + 16;


    // // storeBitPacket(packet,66,64,32); //original ipv4
    // // storeBitPacket(packet,66,96,32); //original imammmmmage socket port number

    // //So now we have a packet "header" with size of 112 bits

    // //Addition of payload
    storeBitPacket(packet,getImageTypeToNumber(imageName),currentcount,4); //imagetype
    currentcount = currentcount + 4;
    // //Add the image file size
    storeBitPacket(packet,noextsize,currentcount,28); 
    currentcount = currentcount + 28;

    // //Send file name with no extension
    let fileNameBytes = stringToBytes(letNoExt); //Converting file name to bytes

    // //Create buffer of size 32 I guess
    let nameBuffer = new Buffer.alloc(noextsize);

    // //Loops over length of filename string, copied filename string to bitstream
    for(var i = 0; i < noextsize; i++){
      //Copying file name to bitstream
      nameBuffer[i] = fileNameBytes[i];
      packet[i+(currentcount/8)] = nameBuffer[i]
    }

    //Finally this should be good for this
    return packet;
  },
  getImageFriend: function (sequence,timestamp,image, imagesize) {
    // enter your code here
  
    //Build a packet based on the request sent by the client
    
  
        //Otherwise we add the image payload in base64 below the header
  
            //console.log(imagesize)
            
            //Compose packet to be of size 12 + imagesize
            packet = new Buffer.alloc(12 +imagesize);
  
            //Built the packet with image specific information
            storeBitPacket(packet,7,0,4); //version
            storeBitPacket(packet,1,4,8);//Response type 
            storeBitPacket(packet,sequence,12,20);//Sequence #
            storeBitPacket(packet,timestamp,32,32); //Timestamp
            storeBitPacket(packet,imagesize,64,32); // Image size
  
            //Convert image -> base64, then convert this to a Buffer
            // var buf = Buffer.from(contents.toString('base64'), 'base64');
  
            // //Copy buffer received from image, and copy this over to the packet
            // for(var i = 0; i < imagesize; i++){
  
            //     packet[i+12] = buf[i];
  
            // }//Copy buffer received from image, and copy this over to the packet
  
  
            // let imageContent = fs.readFileSync(IMAGE_PATH + imagename, {encoding: 'base64'});
            // var bufferFile = Buffer.from(imageContent.toString('base64'), 'base64');
  
            
            for(let i = 0; i < imagesize; i++){
  
                packet[i+12] = image[i];
  
            }
       
     
    //Return packet to write command
    return packet;
  },
  getImagePacket: function (response,sequence,timestamp,imagename) {
    // enter your code here

        //Otherwise we add the image payload in base64 below the header

        IMAGE_PATH = "/Users/nick/Documents/School/3314/Assignments/npysklyw-SE3314b-assignment3/peer2/Client/"
            //Get file, convert to base64 -> using fs
            let contents = fs.readFileSync(IMAGE_PATH + imagename , {encoding: 'base64'});

            //Determine the file size of the image
            imagesize = getFilesizeInBytes(IMAGE_PATH + imagename);
            //console.log(imagesize)
            
            //Compose packet to be of size 12 + imagesize
            packet = new Buffer.alloc(12 +imagesize);

            //Built the packet with image specific information
            storeBitPacket(packet,7,0,4); //version
            storeBitPacket(packet,response,4,8);//Response type 
            storeBitPacket(packet,sequence,12,20);//Sequence #
            storeBitPacket(packet,timestamp,32,32); //Timestamp
            storeBitPacket(packet,imagesize,64,32); // Image size

            //Convert image -> base64, then convert this to a Buffer
            var buf = Buffer.from(contents.toString('base64'), 'base64');

            //Copy buffer received from image, and copy this over to the packet
            for(var i = 0; i < imagesize; i++){

                packet[i+12] = buf[i];

            }//Copy buffer received from image, and copy this over to the packet


            let imageContent = fs.readFileSync(IMAGE_PATH + imagename, {encoding: 'base64'});
            var bufferFile = Buffer.from(imageContent.toString('base64'), 'base64');

            
            for(let i = 0; i < imagesize; i++){

                packet[i+12] = bufferFile[i];

            
    }     
     
    //Return packet to write command
    return packet;
},
};

function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

// Store integer value into the packet bit stream
function storeBitPacket(packet, value, offset, length) {
  // let us get the actual byte position of the offset
  let lastBitPosition = offset + length - 1;
  let number = value.toString(2);
  let j = number.length - 1;
  for (var i = 0; i < number.length; i++) {
    let bytePosition = Math.floor(lastBitPosition / 8);
    let bitPosition = 7 - (lastBitPosition % 8);
    if (number.charAt(j--) == "0") {
      packet[bytePosition] &= ~(1 << bitPosition);
    } else {
      packet[bytePosition] |= 1 << bitPosition;
    }
    lastBitPosition--;
  }
}

//Return the length of a string
function byteCount(s) {
  return encodeURI(s).split(/%..|./).length - 1;
}
//Convert image extension to number
//Return the number
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

//Calculate filesize of a file
function getFilesizeInBytes(filename) {

  //Real file
  var stats = fs.statSync(filename);

  //Get size of file
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}
