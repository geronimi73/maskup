"use client"

import { useState, useRef } from "react"

export default function ImageUploader({ onImagesUploaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))

    const imagePromises = imageFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            file: file,
            dataUrl: e.target.result,
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises).then((images) => {
      onImagesUploaded(images)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e) => {
    handleFiles(e.target.files)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => {fileInputRef.current.click()}}
      >
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
        <p className="text-gray-600 mb-4">Drag and drop your images here, or click to select files</p>
        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileInput} className="hidden" id="file-upload" />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Select Images
        </label>
      </div>
    </div>
  )
}
