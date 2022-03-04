let fs = require("fs");
let singleton = require('./Singleton');

var packet = {
    header: new Uint8Array(12),
    payload: undefined
};

module.exports = {

    init: function (imageName) { // feel free to add function parameters as needed
        try {
            packet.payload = new Uint8Array(loadFile(imageName));
        } catch (err) {
            packet.payload = undefined;
            console.error(`Could not find file ${imageName}`);    
        }

        storeBitPacket(packet.header, 7, 0, 4); // version = 7

        const responseType = (packet.payload == undefined) ? 2 : 1;
        storeBitPacket(packet.header, responseType, 4, 8); // responseType
        storeBitPacket(packet.header, singleton.getSequenceNumber(), 12, 20); // sequence
        storeBitPacket(packet.header, singleton.getTimestamp(), 32, 32); // timestamp

        const payloadLen = (packet.payload == undefined) ? 0 : packet.payload.length;
        storeBitPacket(packet.header, payloadLen, 64, 32);
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function () {
        return (packet.payload == undefined) ? packet.header : new Uint8Array([...packet.header, ...packet.payload]);
    }
};

function loadFile(imageName) {
    return fs.readFileSync(`./images/${imageName}`);
}

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