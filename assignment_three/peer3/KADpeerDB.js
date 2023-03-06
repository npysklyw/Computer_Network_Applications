var server = require("./Server/Server_KADpeer");
var client = require("./Client/Client_KADpeer");
//let hostserverIPandPort = process.argv[3].split(":");

let hostName = process.argv[1].split('/').at(-2);
//let 
//console.log( process.argv[1].split('/')[-1])
//If includes p

if (process.argv.includes('-p')) {
    //run the client on the port 
   //w console.log(process.argv[3].split(":"));
    let hostserverIPandPort = process.argv[3].split(":");
    let PORT = hostserverIPandPort[1];
    let HOST = hostserverIPandPort[0];

    
    //Run the client program
   
    client.clientRun(PORT,HOST,hostName);

}
else {
    // console.log("No idea what to run")
    console.log("Run the server");
    server.runServer(hostName);
}

// else if(process.argv.size === 2) {
//     //Run the server program
//     console.log("Run the server");
//     server.runServer();
// }