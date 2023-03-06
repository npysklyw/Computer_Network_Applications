
// Some code need to be added here, that are common for the module

module.exports = {
    timestamp: this.timestamp,
    sequenceNumber: this.sequenceNumber,

    init: function() {
       // init function needs to be implemented here //


        //Initialize the timestamp as a random number from 1-999
        this.timestamp = Math.floor(Math.random()*999) + 1;
        

        this.sequenceNumber = Math.floor(Math.random()*1048575) + 1;

        //Set interval will execute every 10 ms
        setInterval(() => {
            //Increment the timestamp
            if (this.timestamp >= (Math.pow(2,32))){
                this.timestamp = 0
            }
            else {
                this.timestamp= this.timestamp + 1;
            }
        
            
        }, 10 );

    },


    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
      // Enter your code here //
      this.sequenceNumber++;
        return this.sequenceNumber;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        
        return this.timestamp;
    }


};

