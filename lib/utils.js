import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export async function dataURLToCanvas(dataURL) {
  // load URL
  const tmpImgEl = new Image();
  tmpImgEl.src = dataURL;
  await tmpImgEl.decode()
  const naturalSize = {w: tmpImgEl.naturalWidth, h: tmpImgEl.naturalHeight}

  // draw img from URL onto temp canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext("2d");
  canvas.height = naturalSize.h
  canvas.width = naturalSize.w
  context.drawImage(tmpImgEl, 0, 0, naturalSize.w, naturalSize.h, 0, 0, naturalSize.w, naturalSize.h)

  return canvas
}

export function canvasToBlob(canvas, blobType=null) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      resolve(blob) 
    }, blobType)
  });
}

export function maskToBw(canvasOrig) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')
  canvas.height = canvasOrig.height
  canvas.width = canvasOrig.width

  ctx.drawImage(canvasOrig, 0, 0, canvasOrig.width, canvasOrig.height, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const threshold = 0

    if (r > threshold || g > threshold || b > threshold) {
      data[i + 0] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = 255
    } else {
      data[i + 0] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 255        
    }
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas

}
