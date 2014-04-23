module.exports = {
    
    // Function to test if device is iOS 7 or later
    isiOS7Plus : function() {
        // iOS-specific test
        if (Titanium.Platform.name == 'iPhone OS') {
            var version = Titanium.Platform.version.split(".");
            var major = parseInt(version[0], 10);

            // Can only test this support on a 3.2+ device
            if (major >= 7) {
                return true;
            }
        }
        return false;
    }
    
};

