const fs = require('fs');
let sequenceNumber;
let timerInterval = 10;
let timer;
let dhttable;
let id;
let ip;
let port;
let name;
let serverPort;
let lKL;

function timerRun() {
    timer++;
    if (timer == 4294967295) {
        timer = Math.floor(1000 * Math.random()); // reset timer to be within 32 bit size
    }
}

module.exports = {
    init: function (n) {
        timer = Math.floor(1000 * Math.random()); /* any random number */
        setInterval(timerRun, timerInterval);
        sequenceNumber = Math.floor(1000 * Math.random()); /* any random number */
        dhttable = new Array(160);
        name = n; 
        this.setLocalKeyList();
    },
    setServer: function(s) {
        serverPort = s;
    },
    getLKL: function() {
        return this.lKL;
    },
    getServer: function() {
        return serverPort;
    },
    getHostName: function() {
        return name;
    },
    setIPPort: function(i,p) {
        ip = i;
        port = p;
        id =  this.getPeerID(i,p)
    },
    getPort: function() {
        return port;
    },
    getIP: function() {
        return ip;
    },
    getID: function() {
        return id
    },
    
    getKeyID: function (key) {
        var crypto = require('crypto')
        var sha1 = crypto.createHash('sha1')
        sha1.update(key)
        return sha1.digest('hex')
    },
    setLocalKeyList: function() {
        //read iamge in folder
        //determine keyid from this 
        //imageid, imagename

       // this.lKL = [[]]
       tempArray = []

        var files = fs.readdirSync(process.cwd()+'/Client/');
        console.log(files)
        let check = ["BMP","JPEG","GIF","PNG","TIFF","RAW"];
        files.forEach(element => {

            if (element.split(".").at(-1)) {
                if (check.includes(element.split(".").at(-1).toUpperCase())) {
                    tempArray.push(this.getKeyID(element),element)
                    
                }

                
            }
            
        });

        this.lKL = tempArray;
    },
    getDHT: function() {
        return dhttable;
    },
    getLeft: function returnLeft(a, b) {
        let ans = "";
            for (let i = 0; i < a.length ; i++)
            {
                // If the Character matches
                if (a[i] == b[i])
                    ans += "0";
                else
                    ans += "1";
            }
            
            for (let i = 0; i < ans.length ; i++)
            {
                if (ans[i]==1) {
                    return i +1;
                }
            } 
            return ans.length;
        },
    pushBucket: function(t,p) {
        //p = [ip,port]
        //determine left most

        let idBin = this.Hex2Bin(this.getID());
        let newidBin = this.Hex2Bin(this.getPeerID(p[0],p[1]));
        
        let index = this.getLeft(idBin,newidBin);
        //let index =  Math.floor(160 * Math.random());

      
        if (typeof t[index]==="undefined") {
            t[index] = [p[0],p[1],this.getPeerID(p[0],p[1])]
        }
        else {
            let pNote = this.Hex2Bin(t[index][2] );
            if (this.XORing(newidBin,idBin) > this.XORing(pNote,idBin)) {
                //THis would meanthat initail closer
                console.log("Peer " +  t[index][2] + " is closer than the new peer to be added");
                //t[index] = [p[0],p[1],this.getPeerID(p[0],p[1])]

                // if (typeof p !== "undefined") {
                //     t[index+1] = [p[0],p[1],this.getPeerID(p[0],p[1])];
                // }
               
            }
            else {
                
                
               // t[index + 1] = [t[index][0],t[index][1],t[index][2]];
               console.log("** The peer " + t[index][2] + " is removed and");
               console.log("** The peer " + this.getPeerID(p[0],p[1]) + " is added instead");

              
               // t[index +1] = [t[index][0],t[index][1],t[index][2]];
                t[index] = [p[0],p[1],this.getPeerID(p[0],p[1])];
              //  console.log(t[index +1] + "value")
               

            }
            
        }
        

    },


    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function () {
        sequenceNumber++;
        return sequenceNumber;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function () {
        return timer;
    },

    //--------------------------
    //getPeerID: takes the IP and port number and returns 20 bytes Hex number
    //--------------------------
    getPeerID: function (IP, port) {
        var crypto = require('crypto')
        var sha1 = crypto.createHash('sha1')
        sha1.update(IP + ':' + port)
        return sha1.digest('hex')
    },
   

    //--------------------------
    //Hex2Bin: convert Hex string into binary string
    //--------------------------
    Hex2Bin: function (hex) {
        var bin = ""
        hex.split("").forEach(str => {
            bin += parseInt(str, 16).toString(2).padStart(8, '0')
        })
        return bin
    },

    //--------------------------
    //XORing: finds the XOR of the two Binary Strings with the same size
    //--------------------------
    XORing: function (a, b){
    let ans = "";
        for (let i = 0; i < a.length ; i++)
        {
            // If the Character matches
            if (a[i] == b[i])
                ans += "0";
            else
                ans += "1";
        }
        return ans;
    }
};