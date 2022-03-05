var timestamp;
var sequence = Math.floor(Math.random() * 10);
const sequenceBound = 2^20;

module.exports = {
    init: function() {
       timestamp = Math.floor(Math.random() * 999);
       setInterval(() => {timestamp = timerTick()}, 10);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
        sequence++;

        return sequence % sequenceBound;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        return timestamp;
    }
};

// increments the timer correctly
function timerTick() {
    if (timestamp == (2^32 - 1)) {
        timestamp = 0;
    } else {
        timestamp++;
    }
    
    return timestamp;
}
