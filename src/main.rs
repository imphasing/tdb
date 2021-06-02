use std::collections::HashMap;

mod tdb;

fn main() -> () {
    let mut tdb = tdb::Tdb {
        root_dir: "D:\\tdb\\".to_string(),
        index: HashMap::new()
    };

    tdb.init();

    tdb.set_key("test".to_string(), "lol".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "this".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "is".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "a".to_string()).expect("write failed");
    tdb.set_key("test".to_string(), "test".to_string()).expect("write failed");

    let val = tdb.get_key("test".to_string());

    println!("{:?}", val);

    ()
}