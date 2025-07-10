"use client"

import { useState, useRef, useEffect } from "react"

import { Sparkles, Loader2 } from "lucide-react"
import { canvasToBlob } from "@/lib/utils" 

export default function ImageAnnotator({ images, currentIndex, onIndexChange, annotations, onAnnotationUpdate }) {
  const canvasRef = useRef(null)
  const maskCanvasRef = useRef(null) // Separate canvas for black/white mask
  const imageCanvasRef = useRef(null) // Separate canvas for black/white mask
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(20)
  const [maxBrushSize, setMaxBrushSize] = useState(500)
  const [prompt, setPrompt] = useState("")
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)

  const currentImage = images[currentIndex]
  const currentAnnotation = annotations[currentImage?.id] || { prompt: "", mask: null }

  useEffect(() => {
    if (currentImage) {
      setPrompt(currentAnnotation.prompt || "")
      loadImageAndMask()
    }
  }, [currentIndex, currentImage])

  const generateCaption = async () => {
    setIsGeneratingCaption(true)

    try {
      // Convert image to base64 for API call
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imgDataURL: currentImage.dataUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate caption")
      }

      const data = await response.json()
      console.log(data)
      const generatedCaption = data.caption

      // Update the prompt with the generated caption
      setPrompt(generatedCaption)
      onAnnotationUpdate(currentImage.id, {
        prompt: generatedCaption,
        mask: currentAnnotation.mask,
      })
    } catch (error) {
      console.error("Error generating caption:", error)
      alert("Failed to generate caption. Please try again.")
    } finally {
      setIsGeneratingCaption(false)
    }
  }

  const loadImageAndMask = async () => {
    // Load image
    const img = new Image()
    img.src = currentImage.dataUrl
    await img.decode()

    // Draw image onto offscreen image canvas
    const imageCanvas = imageCanvasRef.current
    const imageCanvasCtx = imageCanvas.getContext("2d")
    imageCanvas.width = img.width
    imageCanvas.height = img.height
    imageCanvasCtx.drawImage(img, 0, 0)

    // Load mask 
    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas.getContext("2d")
    maskCanvas.width = img.width
    maskCanvas.height = img.height

    if (currentAnnotation.mask) {
      const maskImg = new Image()
      maskImg.src = currentAnnotation.mask
      await maskImg.decode()
      maskCtx.drawImage(maskImg, 0, 0)
    }

    // make brush size 30%
    setBrushSize(Math.round(Math.min(imageCanvas.height, imageCanvas.width) * 0.07))

    updateVisualOverlay()

  }

  const updateVisualOverlay = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // 1 draw original image
    canvas.width = imageCanvasRef.current.width
    canvas.height = imageCanvasRef.current.height
    ctx.drawImage(imageCanvasRef.current, 0, 0)

    // 2 draw mask with alpha
    const maskCanvas = maskCanvasRef.current
    const maskAlpha = 0.6
    ctx.globalAlpha = maskAlpha
    ctx.drawImage(maskCanvas, 0, 0,);
    ctx.globalAlpha = 1;

  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    draw(e)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const maskColor = "#C440DB"
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Draw black circle on mask canvas
    maskCtx.globalCompositeOperation = "source-over"
    maskCtx.fillStyle = maskColor 
    maskCtx.beginPath()
    maskCtx.arc(x, y, brushSize, 0, 2 * Math.PI)
    maskCtx.fill()

    // Update visual overlay
    updateVisualOverlay()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveMask()
    }
  }

  const saveMask = () => {
    const maskCanvas = maskCanvasRef.current
    const maskDataUrl = maskCanvas.toDataURL("image/png")

    onAnnotationUpdate(currentImage.id, {
      prompt: prompt,
      mask: maskDataUrl,
    })
  }

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas.getContext("2d")

    // Clear mask canvas and fill with white
    // maskCtx.fillStyle = "#000000"
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)

    // Update visual overlay
    updateVisualOverlay()

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
              disabled={currentIndex === 0 || isGeneratingCaption}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onIndexChange(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1 || isGeneratingCaption}
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
            max={maxBrushSize}
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
          <div className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe what you're masking..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={generateCaption}
              disabled={isGeneratingCaption}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2 whitespace-nowrap"
            >
              {isGeneratingCaption ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGeneratingCaption ? "Generating..." : "Caption"}</span>
            </button>
          </div>
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
            className="border border-gray-300 cursor-paint max-w-full h-auto"
            style={{ maxHeight: "600px" }}
          />
          {/* Hidden mask and image canvas */}
          <canvas ref={maskCanvasRef} className="hidden" />
          <canvas ref={imageCanvasRef} className="hidden" />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Draw on the image to edit the mask. Red overlay shows your current mask.
        </div>
      </div>
    </div>
  )
}
