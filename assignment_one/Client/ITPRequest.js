// You may need to add some delectation here


module.exports = {

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function (imageName,version) {
    // enter your code here

    //Get remove extension
    letNoExt = imageName.split(".")[0];

    //Create a packet
    packet = new Buffer.alloc(12 + byteCount(letNoExt));
    
    //Formulate the packet
    storeBitPacket(packet,version,0,4); //version
    storeBitPacket(packet,0,4,20);
    storeBitPacket(packet,1,24,8); 
    storeBitPacket(packet,66,32,32); //timestamp
    storeBitPacket(packet,getImageTypeToNumber(imageName),64,4); //imagetype

    storeBitPacket(packet,byteCount(letNoExt),68,28); //file size

    let fileNameBytes = stringToBytes(letNoExt); //Converting file name to bytes
    fileSize = byteCount(letNoExt);  //Get size of file

    //Create buffer
    let nameBuffer = new Buffer.alloc(fileSize);

    //Loops over length of filename string, copied filename string to bitstream
    for(var i = 0; i < fileSize; i++){
      //Copying file name to bitstream
      nameBuffer[i] = fileNameBytes[i];
      packet[i+12] = nameBuffer[i]
    }

   

    return packet;
  },
  

};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

//Return the length of a string
function byteCount(s) {
  return encodeURI(s).split(/%..|./).length - 1;
}

// Convert a given string to byte array
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

// Store integer value into specific bit poistion the packet
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


  
function bytesToString(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
      result += String.fromCharCode(array[i]);
  }
  return result;
}