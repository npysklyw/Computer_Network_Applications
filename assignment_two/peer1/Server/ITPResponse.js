//Fields that compose the ITP header
let version, requestType, currentTime;

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
    //fill by default packet fields:
    version = ver;

    //build the header bistream:
    //--------------------------
    

    //fill out the header array of byte with ITP header fields

    let noOfPeers = dhttable.length;
    this.responseHeader = new Buffer.alloc(32 + noOfPeers*48);
    let senderNameL =  byteCount(senderName);

    // version 4 bit
    storeBitPacket(this.responseHeader, version, 0, 4);
    //message type, for this it should generally be send to only one for welcome
    storeBitPacket(this.responseHeader, resType, 4, 8);
    //number of peers in the DHT table currently
    storeBitPacket(this.responseHeader, noOfPeers, 12, 8);
    //sender name length in bytes - 12 bit, still trying to determien what this is about
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
    //console.log(noOfPeers)
    if (noOfPeers != 0) {
      for (j = 0; j < noOfPeers; j++) {
        //     this.payload[j] = stringToBytes("127.0.0.1:3000")  ;//dhttable[j][0]
        //geet each peer info
  
        if (dhttable[j] != null) {
        let currentPeer = dhttable[j];//get specifc peer
        //console.log(byteCount(currentdate[0]));
        let ip = currentPeer[0].split('.');
        
        
        ip.forEach(element => {
          storeBitPacket(this.responseHeader, Number(element), currentcount, 8);
          currentcount = currentcount + 8;
  
        });
        storeBitPacket(this.responseHeader, Number(currentPeer[1]), currentcount, 16);
        currentcount = currentcount+ 16;
      }
       }
    }
    

   
    //noOfPeers*


 

  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function (nl) {
    let packet = new Buffer.alloc(this.payload.length + 32 + 2*48);
    //construct the packet = header + payload
    for (var Hi = 0; Hi < (32 + 2*48); Hi++) packet[Hi] = this.responseHeader[Hi];
    for (var Pi = 0; Pi < this.payload.length; Pi++)
      packet[Pi + (32 + 2*48)] = this.payload[Pi];

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