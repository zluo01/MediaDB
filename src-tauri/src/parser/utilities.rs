use std::process::Output;
use std::{fs, path::Path, path::PathBuf, process::Command};

pub fn get_relative_path(path: &Path, base: &Path) -> Option<PathBuf> {
    let relative_path = path.strip_prefix(base);
    if relative_path.is_ok() {
        return Some(relative_path.unwrap().to_path_buf());
    }
    None
}

#[cfg(target_os = "windows")]
fn execute_command(args: &Vec<&str>) -> Output {
    use std::os::windows::process::CommandExt;
    Command::new("ffmpeg")
        .args(args)
        // https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags
        .creation_flags(0x08000000)
        .output()
        .expect("Failed to execute command")
}

#[cfg(not(target_os = "windows"))]
fn execute_command(args: &Vec<&str>) -> Output {
    Command::new("ffmpeg")
        .args(args)
        .output()
        .expect("Failed to execute command")
}

pub fn convert_image(src_path: &str, dst_path: &str) -> Result<(), String> {
    let dst_conversion_path = format!("{}.avif", dst_path);

    let args = vec![
        "-y",
        "-i",
        src_path,
        "-c:v",
        "libsvtav1",
        "-an",
        "-preset",
        "4",
        "-vf",
        "scale='if(gt(a,320/480),320,-2)':'if(gt(a,320/480),-2,480)'",
        "-loglevel",
        "fatal",
        &dst_conversion_path,
    ];

    let output = execute_command(&args);

    if !&output.status.success() {
        return Err(format!(
            "Fail to covert image. Raising error {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    if let Err(e) = fs::rename(&dst_conversion_path, dst_path) {
        return Err(format!(
            "Fail to rename file from {:?} to {:?}. Raising error {}",
            &dst_conversion_path, dst_path, e
        ));
    }

    Ok(())
}
