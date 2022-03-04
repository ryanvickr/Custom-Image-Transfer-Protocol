// You may need to add some delectation here
var packet = {
	header : new Uint8Array(12),
	payload : []
}

module.exports = {
	init: function (version, imageName, timestamp) {
		storeBitPacket(packet.header, version, 0, 4); // version
		storeBitPacket(packet.header, 0, 4, 20); // reserved space
		storeBitPacket(packet.header, 0, 24, 8); // request type

		storeBitPacket(packet.header, timestamp, 32, 32); // timestamp
		
		// image information
		try {
			const imageType = getImageType(imageName);
			storeBitPacket(packet.header, imageType, 64, 4);
			
			const fileNameBytes = stringToBytes(imageName);
			storeBitPacket(packet.header, fileNameBytes.length, 68, 28);
			packet.payload = new Uint8Array(fileNameBytes);

			printPacketBit(packet.header);
			console.log("----")
			printPacketBit(packet.payload);
		} catch(err) {
			console.error(err);
			return;
		}
	},

	//--------------------------
	//getBytePacket: returns the entire packet in bytes
	//--------------------------
	getBytePacket: function () {
		return new Uint8Array([...packet.header, ...packet.payload]);
	},
};

//  TEMP DELETE LATER:
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

function getImageType(imageName) {
	const re = /(?:\.([^.]+))?$/;
	const extension = re.exec(imageName.trim().toLowerCase())[1];

	switch(extension) {
		case "bmp":
			return 1;
		case "jpeg":
			return 2;
		case "gif":
			return 3;
		case "png":
			return 4;
		case "tiff":
			return 5;
		case "raw":
			return 15;
		default:
			throw `The file extension '${extension}' is not supported!`;
	}
}


//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

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
