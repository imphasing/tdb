use std::fs;
use std::fs::OpenOptions;
use std::io::prelude::*;
use std::path::Path;

// this is a segment of the database - a file somewhere in the system. load and unload need to follow ownership
#[derive(Debug)]
pub struct Segment {
    pub filename: String,
    pub content: String 
}

impl Segment {
    pub fn load(&mut self) -> Result<(), Box<dyn std::error::Error + 'static>> {
        if Path::new(&self.filename).exists() {
            self.content = fs::read_to_string(&self.filename)?.parse()?;
        } else {
            self.content = "".to_string();
        }

        Ok(())
    }

    pub fn write(&mut self, content: String) -> std::io::Result<()> {
        // append the content to the segment and write it out
        self.content.push_str(&content);

        let mut file = OpenOptions::new()
            .write(true)
            .append(true)
            .create(true)
            .open(&self.filename)
            .unwrap();

        write!(file, "{}", &content)
    }
}