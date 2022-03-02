
// Some code need to be added here, that are common for the module
var timestamp = -1;

module.exports = {
    init: function() {
       timestamp = Math.floor(Math.random() * 998 + 1);
       setInterval(() => {timestamp = this.getSequenceNumber()}, 10);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
        return timestamp + 1;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        return timestamp;
    }
};