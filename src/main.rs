use std::collections::HashMap;

mod tdb;

fn main() -> () {
    // deserialize the index here to handle process restarts
    let mut tdb = tdb::Tdb {
        index: HashMap::new()
    };

    // set a key a bunch, then get the key to test this
    tdb.set_key("test".to_string(), "lol".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "this".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "is".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "a".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "test".to_string()).expect("write failed");

    // print the current key value
    let val = tdb.get_key("test".to_string());
    println!("{:?}", val);

    ()
}