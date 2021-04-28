const TDB = require("./TDB");
const db = new TDB("D:\\tdb");

db.getKey("test", (data) => {
    db.compact(() => {
        console.log("compaction complete");
    });
    
    console.log(`deserialized memtable "test" key: ${data}`);
});

db.writeKey("test", "something", () => {
    db.getKey("test", (data) => {
        console.log(`test: ${data}`);

        db.writeKey("test", "what", () => {
            db.getKey("test", (data) => {
                console.log(`test: ${data}`);
            })
        })
    });
});