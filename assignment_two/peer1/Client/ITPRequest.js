
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