use crate::model::database::{MediaTag, Tag, TagBase};
use rayon::prelude::*;
use std::collections::{HashMap, HashSet};

pub fn group_tags<T: TagBase>(tags: &[T]) -> HashMap<&str, Vec<Tag>> {
    tags.iter().fold(HashMap::new(), |mut acc, tag| {
        acc.entry(tag.key())
            .or_insert_with(Vec::new)
            .push(tag.to_tag());
        acc
    })
}

pub fn filter_media(
    tags_group: &HashMap<String, Vec<MediaTag>>,
    filter_tags: &Vec<Tag>,
    filter_type: u8,
) -> Vec<String> {
    if filter_tags.is_empty() {
        return tags_group.keys().map(|k| k.to_string()).collect();
    }

    let filter_tag_groups = group_tags(filter_tags);

    tags_group
        .into_par_iter()
        .filter(|(_, v)| {
            let groups = group_tags(&v);
            let mut keep = true;
            for (key, value) in groups {
                if let Some(filter_tags) = filter_tag_groups.get(key) {
                    keep = keep & check_filter_condition(&value, filter_tags, filter_type);
                }
            }
            return keep;
        })
        .map(|(k, _)| k.to_string())
        .collect()
}

fn check_filter_condition(source: &Vec<Tag>, target: &Vec<Tag>, filter_type: u8) -> bool {
    let source_set: HashSet<_> = source.into_iter().collect();
    let target_set: HashSet<_> = target.into_iter().collect();

    // OR, if media tag contains any of the filter tag, return true
    if filter_type == 0u8 {
        return source_set.intersection(&target_set).count() > 0;
    }

    // AND, we need to make sure source tags contains all tags from filter tags
    target_set.is_subset(&source_set)
}
