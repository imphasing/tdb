const fs = require('fs');

class Filesystem {
    constructor(fsroot) {
        this.fsroot = fsroot;
        this.segment = "segment";
    }

    // check if the memtable and segments exist
    startup() {
        this.initIfNotExists("memtable", "{}");
        this.initIfNotExists("segment", "");
    }

    // check if a file exists, touch it if not (synchronous)
    initIfNotExists(name, init) {
        if (!fs.existsSync(this.fsroot + "/" + name)) {
            fs.writeFileSync(this.fsroot + "/" + name, init, {flag: 'wx'});
        }
        
        return;
    }

    // get the contents at the offset from the memtable
    getKey(file, offset, size, cb) {
        fs.open(this.fsroot + "/" + file, 'r', (err, fd) => {
            var buffer = new Buffer.alloc(size);
            fs.readSync(fd, buffer, 0, size, offset);
            
            cb(buffer.toString());
        });
    }

    // update a key in the segment LSM style by appending
    writeKey(file, key, value, cb) {
        const path = this.fsroot + "/" + file;
        const stats = fs.statSync(path);

        fs.appendFileSync(path, value);
        cb(stats.size, Buffer.byteLength(value, "utf8"));
    }

    // copy a piece of a file to a new file, we use this for compaction
    copySegmentPart(file, to, start, size, cb) {
        fs.open(this.fsroot + "/" + file, 'r', (err, fd) => {
            var buffer = new Buffer.alloc(size);
            console.log(this.fsroot + "/" + file);
            fs.readSync(fd, buffer, 0, size, start);
            fs.appendFileSync(this.fsroot + "/" + to, buffer.toString());

            cb();
        });
    }

    // JSON serialized memtable might be suboptimal
    writeMemtable(data) {
        fs.writeFileSync(this.fsroot + "/memtable", JSON.stringify(data));
    }

    // read the JSON serialized memtable
    readMemtable() {
        return JSON.parse(fs.readFileSync(this.fsroot + "/memtable", "utf8"));
    }
}

module.exports = Filesystem;