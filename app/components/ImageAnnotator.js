"use client"

import { useState, useRef, useEffect } from "react"

export default function ImageAnnotator({ images, currentIndex, onIndexChange, annotations, onAnnotationUpdate }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(20)
  const [prompt, setPrompt] = useState("")
  const [maskData, setMaskData] = useState(null)

  const currentImage = images[currentIndex]
  const currentAnnotation = annotations[currentImage?.id] || { prompt: "", mask: null }

  useEffect(() => {
    if (currentImage) {
      setPrompt(currentAnnotation.prompt || "")
      loadImageAndMask()
    }
  }, [currentIndex, currentImage])

  const loadImageAndMask = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image
      ctx.drawImage(img, 0, 0)

      // Load existing mask if available
      if (currentAnnotation.mask) {
        const maskImg = new Image()
        maskImg.onload = () => {
          ctx.globalCompositeOperation = "source-over"
          ctx.globalAlpha = 0.5
          ctx.drawImage(maskImg, 0, 0)
          ctx.globalAlpha = 1
        }
        maskImg.src = currentAnnotation.mask
      }
    }

    img.src = currentImage.dataUrl
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    draw(e)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 0.5
    ctx.fillStyle = "#ff0000"
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI)
    ctx.fill()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveMask()
    }
  }

  const saveMask = () => {
    const canvas = canvasRef.current
    const maskCanvas = document.createElement("canvas")
    const maskCtx = maskCanvas.getContext("2d")

    maskCanvas.width = canvas.width
    maskCanvas.height = canvas.height

    // Create a mask-only version
    maskCtx.drawImage(canvas, 0, 0)
    const maskDataUrl = maskCanvas.toDataURL()

    onAnnotationUpdate(currentImage.id, {
      prompt: prompt,
      mask: maskDataUrl,
    })
  }

  const clearMask = () => {
    loadImageAndMask()
    onAnnotationUpdate(currentImage.id, {
      prompt: prompt,
      mask: null,
    })
  }

  const handlePromptChange = (e) => {
    const newPrompt = e.target.value
    setPrompt(newPrompt)
    onAnnotationUpdate(currentImage.id, {
      prompt: newPrompt,
      mask: currentAnnotation.mask,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Image {currentIndex + 1} of {images.length}: {currentImage.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onIndexChange(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium">Brush Size:</label>
          <input
            type="range"
            min="5"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600">{brushSize}px</span>
          <button onClick={clearMask} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
            Clear Mask
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prompt/Caption (optional):</label>
          <input
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe what you're masking..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-300 cursor-crosshair max-w-full h-auto"
            style={{ maxHeight: "600px" }}
          />
        </div>
      </div>
    </div>
  )
}
