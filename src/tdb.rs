use std::collections::HashMap;
use std::str;

mod segment;
mod segment_key;

#[derive(Debug)]
pub struct Tdb {
    // this index needs to be serialized to the filesystem so the database works on a process reload
    pub index: HashMap<String, segment_key::SegmentKey>
}

impl Tdb {
    pub fn get_key(&self, key: String) -> Result<String, &'static str> { 
        match self.index.get(&key) {
            Some(data) => {
                let mut segment = segment::Segment {
                    filename: data.segment.clone(),
                    content: "".to_string()
                };

                segment.load().expect("unable to load segment");

                Ok((&segment.content[data.offset as usize..(data.offset + data.length) as usize]).to_string())
            }
            None => Err("key not found")
        }
    }

    pub fn set_key(&mut self, key: String, value: String) -> Result<(), &'static str> {
        // hardcoding the segment filename, this is shitty
        let mut segment = segment::Segment {
            filename: "./test.dat".to_string(),
            content: "".to_string()
        };

        // have to load the segment so we know where the offset is for the new value
        segment.load().expect("unable to load segment");

        // new offset for after the append is done
        let new_offset = segment.content.chars().count() as u32;
        let new_length = value.chars().count() as u32;

        // find the filename, either default or the one on the segment
        let segment_file = match self.index.get(&key) {
            Some(data) => data.segment.clone(),
            None => segment.filename.clone()
        };

        let index_match = segment_key::SegmentKey {
            segment: segment_file,
            offset: new_offset,
            length: new_length
        };

        segment.write(value).expect("unable to write segment");
        self.index.insert(key, index_match);

        println!("index: {:?}", self.index);

        Ok(())
    }
}

