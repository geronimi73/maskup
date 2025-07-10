"use client"

import { useState } from "react"
import { maskToBw, dataURLToCanvas, canvasToBlob } from "@/lib/utils" 
import { Download, Upload, RotateCcw } from "lucide-react"

export default function ExportPanel({ images, annotations, onReset }) {
  const [hfApiKey, setHfApiKey] = useState("")
  const [hfDatasetName, setHfDatasetName] = useState("")
  const [isExportingZIP, setIsExportingZIP] = useState(false)
  const [isExportingHF, setIsExportingHF] = useState(false)

  const annotatedCount = Object.keys(annotations).filter((id) => annotations[id].mask).length

  const downloadAsZip = async () => {
    setIsExportingZIP(true)

    try {
      // Import JSZip dynamically
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (const image of images) {
        const annotation = annotations[image.id]

        // Add original image
        const imageBlob = await fetch(image.dataUrl).then((r) => r.blob())
        zip.file(image.name, imageBlob)

        // Add mask if exists
        if (annotation?.mask) {
          // convert mask dataURL to a Canvas, threshhold the canvas, blob it and save
          let maskCanvas = await dataURLToCanvas(annotation.mask)
          maskCanvas = maskToBw(maskCanvas)
          const maskBlob = await canvasToBlob(maskCanvas)
          const maskName = image.name.replace(/\.[^/.]+$/, "_mask.png")
          zip.file(maskName, maskBlob)
        }

        // Add prompt as text file
        const prompt = annotation?.prompt || "";
        const promptName = image.name.replace(/\.[^/.]+$/, "_prompt.txt");
        zip.file(promptName, prompt);

      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = "maskup_dataset.zip"
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert("Error creating ZIP file: " + error.message)
    }

    setIsExportingZIP(false)
  }

  const uploadToHuggingFace = async () => {
    if (!hfApiKey || !hfDatasetName) {
      alert("Please provide HuggingFace API key and dataset name")
      return
    }

    setIsExportingHF(true)

    try {
      // This is a simplified example - in a real implementation,
      // you'd need to handle the HuggingFace dataset API properly
      alert("HuggingFace upload functionality would be implemented here. For now, please use the ZIP download option.")
    } catch (error) {
      alert("Error uploading to HuggingFace: " + error.message)
    }

    setIsExportingHF(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium mb-4">Export Dataset</h3>

      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Progress:</div>
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(annotatedCount / images.length) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {annotatedCount} of {images.length} images annotated
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Download as ZIP</h4>

          <button
            onClick={downloadAsZip}
            disabled={isExportingZIP || images.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingZIP ? "Creating ZIP..." : "Download ZIP"}</span>
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Upload to HuggingFace 🤗</h4>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="HuggingFace API Key"
              value={hfApiKey}
              onChange={(e) => setHfApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Dataset Name"
              value={hfDatasetName}
              onChange={(e) => setHfDatasetName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={uploadToHuggingFace}
              disabled={isExportingHF || isExportingZIP || !hfApiKey || !hfDatasetName}
              className="w-full px-4 py-2 bg-[#D0A704] text-white rounded-md hover:bg-[#FF9D0B]  flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isExportingHF ? "Uploading..." : "Upload to HF"}</span>
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Project</span>
          </button>          
        </div>
      </div>
    </div>
  )
}
