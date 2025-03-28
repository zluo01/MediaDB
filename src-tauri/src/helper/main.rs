use crate::model::database::{Tag, TagBase};
use std::collections::HashMap;

pub fn group_tags<T: TagBase>(tags: &[T]) -> HashMap<&str, Vec<Tag>> {
    tags.iter().fold(HashMap::new(), |mut acc, tag| {
        acc.entry(tag.key())
            .or_insert_with(Vec::new)
            .push(tag.to_tag());
        acc
    })
}
