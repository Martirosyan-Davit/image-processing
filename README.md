# Image Processing Service

This service allows uploading an image, splitting it into 4 equal parts, applying blur along the inner edges (cut lines), and combining them back into a single image. The result is saved and returned with metadata.

---

## 🛠️ Tech Stack

- **NestJS** — backend framework
- **Sharp** — high-performance image processing
- **TypeScript** — static typing
- **Node.js** — runtime

---

## 📦 Features

- Upload an image (`.png` only)
- Automatically split into 4 equal square segments
- Apply blur on the **cutting edges only** (inside borders)
- Save all segments individually
- Reassemble final image with blurred internal edges
- Log all stages of processing

---

## 📂 API Endpoint

`POST /api/files`

### Request:

- `multipart/form-data`
- Field: `file` (PNG image)

### Response:

```json
{
  "imagePath": "images/final.png"
}
```

#  🧠 Processing Steps
1. Upload the original image

2. Split it into 4 equal parts (clockwise starting from top-left)

3. Blur internal edges of each part:

- Top-left: bottom & right

- Top-right: bottom & left

- Bottom-right: top & left

- Bottom-left: top & right

4. Save each part as 1.png, 2.png, 3.png, 4.png

5. Recombine the 4 parts into final.png

## 🖼️ Example Input:

![input](https://github.com/Martirosyan-Davit/image-processing/blob/main/example/input.png)

## 🖼️ Example Output:

![output](https://github.com/Martirosyan-Davit/image-processing/blob/main/example/output.png)

# 📁 Output Directory

All results are saved in the /images directory:

- 1.png, 2.png, 3.png, 4.png

- final.png


## 🔧 Environment Setup

Before running the project, copy the example environment file:

```bash
cp .env.example .env
```

# 🚀 Run locally
```
yarn install
yarn start:dev
```