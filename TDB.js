const Filesystem = require("./Filesystem");

class TDB {
    constructor(fsroot) {

        // this is the root of the db filesystem where data segments are kept
        this.fs = new Filesystem(fsroot);
        this.fs.startup();

        // this thing is the memtable of keys to filesystem offsets
        // this lets us quickly lookup keys, this data structure must be
        // kept separately from the segment files, this contains the entire index
        // of keys to locations so it needs to be serialized on updates
        this.memtable = this.fs.readMemtable();
    }

    // get the segment information for the key and read it
    getKey(key, cb) {

        // check if the key is even in the memtable to get
        if (!(key in this.memtable)) {
            throw "missing key";
        }

        // get the offset from the start of the segment file, and the 
        // length of data on it
        const lookup = this.memtable[key];
        
        // read through the fs wrapper
        this.fs.getKey(this.fs.segment, lookup.offset, lookup.length, (data) => {
            cb(data);
        });
    }

    // append to the segment, LSM style
    writeKey(key, value, cb) {

        // write to the segment file
        this.fs.writeKey(this.fs.segment, key, value, (offset, length) => {

            // now update the memtable with the latest fs information for
            // this key and call the callback
            this.memtable[key] = { 
                offset: offset,
                length: length
            };

            this.fs.writeMemtable(this.memtable);

            cb();
        });
    }

    // using a memtable and a segment, run through the segment and keep only
    // the latest keys
    compact(cb) {
        // find the min of the memtable, we can throw everything before the 
        // earliest current key

        var furthest = 0;
        var total = 0;

        Object.keys(this.memtable).forEach((key) => {
            console.log(JSON.stringify(this.memtable[key]));
            if (Math.abs(this.memtable[key].offset) > Math.abs(furthest)) {
                furthest = this.memtable[key].offset;
            }
            
            total += this.memtable[key].length;
        });

        // now we know the earliest valid key and the total size of all keys
        // we can compact by just reading from the earliest, total size bytes
        // yielding the compact segment

        console.log(`furthest: ${furthest}`);
        console.log(`total: ${total}`);

        this.fs.copySegmentPart(this.fs.segment, this.fs.segment + "2", furthest, total, () => {
            
            this.fs.segment = this.fs.segment + 2;
            Object.keys(this.memtable, (key) => {
                this.memtable[key].offset -= furthest;
            });

            console.log(JSON.stringify(this.memtable));
            this.fs.writeMemtable(this.memtable);

            cb();
        });
    }
}

module.exports = TDB;