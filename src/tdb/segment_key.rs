// this is just an segment name, offset and length to get the key value from
#[derive(Debug)]
pub struct SegmentKey {
    pub segment: String,
    pub offset: u32,
    pub length: u32
}