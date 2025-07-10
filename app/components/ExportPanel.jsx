"use client"

import { useState } from "react"

export default function ExportPanel({ images, annotations, onReset }) {
  const [hfApiKey, setHfApiKey] = useState("")
  const [hfDatasetName, setHfDatasetName] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const annotatedCount = Object.keys(annotations).filter((id) => annotations[id].mask).length

  const downloadAsZip = async () => {
    setIsExporting(true)

    try {
      // Import JSZip dynamically
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      const imagesFolder = zip.folder("images")
      const masksFolder = zip.folder("masks")

      let promptsText = ""

      for (const image of images) {
        const annotation = annotations[image.id]

        // Add original image
        const imageBlob = await fetch(image.dataUrl).then((r) => r.blob())
        imagesFolder.file(image.name, imageBlob)

        // Add mask if exists
        if (annotation?.mask) {
          const maskBlob = await fetch(annotation.mask).then((r) => r.blob())
          const maskName = image.name.replace(/\.[^/.]+$/, "_mask.png")
          masksFolder.file(maskName, maskBlob)
        }

        // Add prompt to text file
        const prompt = annotation?.prompt || ""
        promptsText += `${image.name}: ${prompt}\n`
      }

      // Add prompts file
      zip.file("prompts.txt", promptsText)

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

    setIsExporting(false)
  }

  const uploadToHuggingFace = async () => {
    if (!hfApiKey || !hfDatasetName) {
      alert("Please provide HuggingFace API key and dataset name")
      return
    }

    setIsExporting(true)

    try {
      // This is a simplified example - in a real implementation,
      // you'd need to handle the HuggingFace dataset API properly
      alert("HuggingFace upload functionality would be implemented here. For now, please use the ZIP download option.")
    } catch (error) {
      alert("Error uploading to HuggingFace: " + error.message)
    }

    setIsExporting(false)
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
            disabled={isExporting || images.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isExporting ? "Creating ZIP..." : "Download ZIP"}
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Upload to HuggingFace</h4>
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
              disabled={isExporting || !hfApiKey || !hfDatasetName}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isExporting ? "Uploading..." : "Upload to HF"}
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <button onClick={onReset} className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Start New Project
          </button>
        </div>
      </div>
    </div>
  )
}
