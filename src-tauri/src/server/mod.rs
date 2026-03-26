use std::path::Path;

use axum::Router;
use tower_http::services::ServeDir;
use tower_http::set_header::SetResponseHeaderLayer;

pub fn start(app_data_dir: &Path, port: u16) {
    let router = Router::new()
        .fallback_service(ServeDir::new(app_data_dir))
        .layer(SetResponseHeaderLayer::if_not_present(
            axum::http::header::CACHE_CONTROL,
            axum::http::HeaderValue::from_static("public, max-age=3600"),
        ));

    // Bind synchronously so the port is listening before the WebView loads.
    let std_listener = std::net::TcpListener::bind(format!("127.0.0.1:{}", port)).unwrap();
    std_listener.set_nonblocking(true).unwrap();

    tauri::async_runtime::spawn(async move {
        let listener = tokio::net::TcpListener::from_std(std_listener).unwrap();
        axum::serve(listener, router).await.unwrap();
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use std::fs;
    use tower::ServiceExt;

    fn test_router(dir: &Path) -> Router {
        Router::new().fallback_service(ServeDir::new(dir)).layer(
            SetResponseHeaderLayer::if_not_present(
                axum::http::header::CACHE_CONTROL,
                axum::http::HeaderValue::from_static("public, max-age=3600"),
            ),
        )
    }

    #[tokio::test]
    async fn serves_existing_file() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        fs::write(&file_path, "hello").unwrap();

        let app = test_router(dir.path());
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/test.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn returns_not_found_for_missing_file() {
        let dir = tempfile::tempdir().unwrap();

        let app = test_router(dir.path());
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/missing.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn sets_cache_control_header() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join("image.jpg");
        fs::write(&file_path, "fake image").unwrap();

        let app = test_router(dir.path());
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/image.jpg")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers().get("cache-control").unwrap(),
            "public, max-age=3600"
        );
    }

    #[tokio::test]
    async fn serves_nested_path() {
        let dir = tempfile::tempdir().unwrap();
        let nested = dir.path().join("covers").join("Movie");
        fs::create_dir_all(&nested).unwrap();
        fs::write(nested.join("poster"), "image data").unwrap();

        let app = test_router(dir.path());
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/covers/Movie/poster")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn rejects_path_traversal() {
        let dir = tempfile::tempdir().unwrap();

        let app = test_router(dir.path());
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/../etc/passwd")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_ne!(response.status(), StatusCode::OK);
    }
}
