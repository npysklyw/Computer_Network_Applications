
// You may need to add some delectation here
const fs = require('fs');

IMAGE_PATH = "./images/"
module.exports = {

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (response,sequence,timestamp,imagename) {
        // enter your code here

        //Build a packet based on the request sent by the client
        if (response == 2) {

            //Create a packet of 12 bytes
            packet = new Buffer.alloc(12);

            //Start to compose a "not found" packet back to the client
            storeBitPacket(packet,7,0,4); //version
            storeBitPacket(packet,response,4,8);//Response type 

            storeBitPacket(packet,sequence,12,20);//Sequence #
            storeBitPacket(packet,timestamp,32,32); //Timestamp
            storeBitPacket(packet,0,64,32); // Image size
        }
        else {

            //Otherwise we add the image payload in base64 below the header

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


                let imageContent = fs.readFileSync(IMAGE_PATH, {encoding: 'base64'});
                var bufferFile = Buffer.from(imageContent.toString('base64'), 'base64');

                
                for(let i = 0; i < imagesize; i++){
    
                    packet[i+12] = bufferFile[i];

                }
        }     
         
        //Return packet to write command
        return packet;
    }


};

//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

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

//Calculate filesize of a file
function getFilesizeInBytes(filename) {

    //Real file
    var stats = fs.statSync(filename);

    //Get size of file
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  }