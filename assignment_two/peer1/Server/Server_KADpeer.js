let net = require('net'),
    singleton = require('./Singleton'),
    handler = require('./ClientsHandler');




let HOST, PORT;
// The function passed to net.createServer() becomes the event handler for the 'connection'
// event. The sock object the callback function receives UNIQUE for each connection

module.exports = {

    runServer: function(hostName) {
       
       
        net.bytesWritten = 300000;
        net.bufferSize = 300000;
        //  PORT = 3000;
        HOST = "127.0.0.1";
        //Create the new server
        let Server_KADpeer = net.createServer();

        //Create the server at port 3000 at 127.0.0.1;
        Server_KADpeer.listen(() => {
           // HOST = "127.0.0.1";
            PORT = Server_KADpeer.address().port;
            //PORT = 3000;
            
            //Display the server information
        console.log('This peer address is '+ HOST + ':' + PORT + " located at " + singleton.getHostName() + " "  + "[" + singleton.getPeerID(HOST,PORT) + "]");
        });
        singleton.init(HOST,PORT,hostName);
        //Use this to act as a server
        Server_KADpeer.on('connection', function(sock) {
           
            handler.handleClientJoining(sock); //called for each client joining
        });
    },
    

}

