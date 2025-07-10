"use client"

import { useState } from "react"
import Image from 'next/image';

import ImageUploader from "./components/ImageUploader"
import ImageAnnotator from "./components/ImageAnnotator"
import ExportPanel from "./components/ExportPanel"

export default function Home() {
  const [images, setImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [annotations, setAnnotations] = useState({})

  const handleReset = () => {
    setImages([])
    setAnnotations({})
    setCurrentImageIndex(0)
  }

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

  return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div 
                onClick={handleReset}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                title="Click to reset and start over"
                // className="flex items-center space-x-3"
              >
                <div>
                  <Image
                    src="/logo.png" // Path to the image in the public folder
                    // alt="Description of the image" // Alt text for accessibility
                    width={50} // Desired width in pixels
                    height={50} // Desired height in pixels
                  />                
                </div>
                <h1 className="text-2xl font-bold text-gray-900">MaskUp</h1>
              </div>
              <p className="text-sm text-gray-600">Image Dataset Annotation Tool</p>
            </div>
          </div>
        </header>
        <main>
          {images.length === 0 ? (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Create ML Datasets with Mask Annotations</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Upload images, draw masks, add prompts, and export to HuggingFace or download as ZIP
                </p>
              </div>
              <ImageUploader onImagesUploaded={handleImagesUploaded} />
            </div>
          ) : (
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
                    onReset={handleReset}
                  />
                </div>
              </div>
            </div>
          ) }
        </main>
      </div>
  )
}
