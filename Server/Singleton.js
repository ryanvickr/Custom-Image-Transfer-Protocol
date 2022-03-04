// Some code need to be added here, that are common for the module
var timestamp;

module.exports = {
    init: function() {
       timestamp = Math.floor(Math.random() * 998 + 1);
       setInterval(() => {timestamp = this.getSequenceNumber()}, 10);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
        if (timestamp == (2^32 - 1)) {
            timestamp = 0;
        } else {
            timestamp++;
        }
        
        return timestamp;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        return timestamp;
    }
};