# Free Media CDN via GitHub

This directory and repository can be used as a **100% free, high-speed CDN** for your portfolio videos, posters, and client assets.

---

## 1. High-Res Images & Posters (< 50 MB) via jsDelivr CDN

Any image committed into your GitHub repository can be loaded globally via the free jsDelivr CDN edge network.

### URL Structure:
```
https://cdn.jsdelivr.net/gh/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>@main/media/<FILENAME>
```

### Example:
If your GitHub username is `devanand` and your repo is `video-portfolio`:
- Commit an image `showreel-poster.jpg` into `media/`
- Direct CDN URL:
  ```
  https://cdn.jsdelivr.net/gh/devanand/video-portfolio@main/media/showreel-poster.jpg
  ```

---

## 2. Large Videos (Up to 2 GB per file) via GitHub Releases

For video files (`.mp4`, `.mov`, `.webm`), Git repositories have file size limits, but **GitHub Releases allow files up to 2 GB each** with unlimited global download bandwidth!

### How to use:
1. Go to your GitHub repository in your browser.
2. Click **Releases** (right sidebar) → **Draft a new release**.
3. Set tag to `v1.0.0-media` and title to `Portfolio Video Assets`.
4. Drag and drop your exported `.mp4` or `.mov` files.
5. Click **Publish release**.
6. Right-click the uploaded file in the release and click **Copy link address**.
7. Paste this direct URL directly into your **Showreel** or **Project** Video URL input in the Admin Panel (`/admin/projects` or `/admin/showreel`)!

### Direct Video URL Structure:
```
https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>/releases/download/<TAG>/<FILENAME>.mp4
```
*Example:*
```
https://github.com/devanand/video-portfolio/releases/download/v1.0.0-media/commercial-reel-4k.mp4
```
The universal Video Player in this portfolio will detect and play this file seamlessly.
