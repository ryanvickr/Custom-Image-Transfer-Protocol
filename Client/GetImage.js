let net = require("net");
let fs = require("fs");
let open = require("open");

let ITPpacket = require("./ITPRequest");

// Enter your code for the client functionality here

const args = parseArgs(process.argv);

try {
    // create packet
    ITPpacket.init(args.version, args.imageName, 1234);
    runServer();
} catch (err) {
    console.error("ERROR: ", err);
}

async function runServer() {
    // Attempt to connect
    const client = new net.Socket();
    client
        .connect({ port: args.port, host: args.host }, async () => {
            console.log(`Connected to ImageDB server on: ${args.host}:${args.port}`);
            client.write(ITPpacket.getBytePacket());
        })
        // When receiving data
        .on("data", async (data) => {
            console.log("ITP packet header received:\n");
            printPacketBit(data.slice(0, 12));
            console.log("\n")

            // parse packet
            const packet = parsePacket(data);
            console.log("Server sent:\n" +
                `\t--ITP version = ${packet.header.version}\n` +
                `\t--Response Type = ${getResponseType(packet.header.responseType)}\n` +
                `\t--Sequence Number = ${packet.header.sequence}\n` +
                `\t--Timestamp = ${packet.header.timestamp}\n`
            );

            if (packet.header.responseType == 1) {
                const fileName = `./${packet.header.sequence}-${args.imageName}`
                fs.writeFileSync(fileName, packet.payload);
                await open(fileName);
            }

            client.end();
        })
        // When connection is closed
        .on("close", async (hadError) => {
            console.log("Closed connection.");
            client.end();
        });
}


// Parse the raw packet
function parsePacket(data) {
    return {
        header: {
            version: parseBitPacket(data, 0, 4),
            responseType: parseBitPacket(data, 4, 8),
            sequence: parseBitPacket(data, 12, 20),
            timestamp: parseBitPacket(data, 32, 32),
            fileSizeBytes: parseBitPacket(data, 64, 32)
        },
        payload: data.slice(12)
    }
}

function getResponseType(responseType) {
    switch (responseType) {
        case 0:
            return "Query";
        case 1:
            return "Found";
        case 2:
            return "Not Found";
        case 3:
            return "Busy";
    }
}

// Parse the command line args
function parseArgs(args) {
    if (args.length != 8) {
        console.error("Invalid arguments specified!");
    } else {
        const serverInfo = args[3].split(":");
        const imageName = args[5];
        const version = parseInt(args[7]);

        return {
            host: serverInfo[0],
            port: parseInt(serverInfo[1]),
            imageName,
            version
        }
    }
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



