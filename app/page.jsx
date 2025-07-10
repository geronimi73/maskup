"use client"

import { useState } from "react"
import ImageUploader from "./components/ImageUploader"
import ImageAnnotator from "./components/ImageAnnotator"
import ExportPanel from "./components/ExportPanel"

export default function Home() {
  const [images, setImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [annotations, setAnnotations] = useState({})

  const handleImagesUploaded = (uploadedImages) => {
    setImages(uploadedImages)
    setCurrentImageIndex(0)
  }

  const handleAnnotationUpdate = (imageId, annotation) => {
    setAnnotations((prev) => ({
      ...prev,
      [imageId]: annotation,
    }))
  }

  if (images.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Create ML Datasets with Mask Annotations</h2>
          <p className="text-lg text-gray-600 mb-8">
            Upload images, draw masks, add prompts, and export to HuggingFace or download as ZIP
          </p>
        </div>
        <ImageUploader onImagesUploaded={handleImagesUploaded} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ImageAnnotator
            images={images}
            currentIndex={currentImageIndex}
            onIndexChange={setCurrentImageIndex}
            annotations={annotations}
            onAnnotationUpdate={handleAnnotationUpdate}
          />
        </div>
        <div className="lg:col-span-1">
          <ExportPanel
            images={images}
            annotations={annotations}
            onReset={() => {
              setImages([])
              setAnnotations({})
              setCurrentImageIndex(0)
            }}
          />
        </div>
      </div>
    </div>
  )
}
