let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');

// You may need to add some delectation here


module.exports = {

    handleClientJoining: function (socket) {
        const timestamp = singleton.getTimestamp();
        console.log(`Client-${timestamp} is connected at timestamp: ${timestamp}`);

        socket.on("data", (data) => {
            console.log(`ITP packet received from Client-${timestamp} (${socket.remoteAddress}:${socket.remotePort})\n`);
            printPacketBit(data);

            const requestPacket = parseRequest(timestamp, data);
            ITPpacket.init(requestPacket.payload);

            const responsePacket = ITPpacket.getPacket();
            socket.write(responsePacket);
        });

        socket.on("end", () => {
            console.log(`Closed Client-${timestamp} (${socket.remoteAddress}:${socket.remotePort})\n`);
        });
    }

};

// parse the raw ITP request
function parseRequest(timestamp, data) {

    const packet = {
        header : {
            version: parseBitPacket(data, 0, 4),
            reserved: parseBitPacket(data, 4, 20),
            reqType: parseBitPacket(data, 24, 8),
            timestamp: parseBitPacket(data, 32, 32),
            imageType: parseBitPacket(data, 64, 4),
            fileNameBytes: parseBitPacket(data, 68, 28)
        },
        payload : bytesToString(data.slice(12))
    }

    console.log(`\nClient-${timestamp} requests:\n` +
                `\t--ITP version: ${packet.header.version}\n` +
                `\t--Timestamp: ${packet.header.timestamp}\n` +
                `\t--Request type: ${getResponseType(packet.header.reqType)}\n` +
                `\t--Image file extension: ${getImageType(packet.header.imageType)}\n` +
                `\t--Image file name: ${packet.payload}\n`);

    return packet;
}

// get the response type in word format
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

// get the file extension in string format
function getImageType(imageType) {
	switch (imageType) {
		case 1: 
            return "BMP";
        case 2: 
            return "JPEG";
        case 3: 
            return "GIF";    
        case 4: 
            return "PNG";
        case 5: 
            return "TIFF";
        case 15: 
            return "RAW";
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

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}