"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button" 
import { Download, Upload, RotateCcw, Loader2 } from "lucide-react"

import { useToast } from "./ToastProvider"
import HelpPopup from "./HelpPopup"
import { maskToBw, dataURLToCanvas, canvasToBlob, emptyMask } from "@/lib/utils" 

import * as hf_hub from "@huggingface/hub";

export default function ExportPanel({ images, annotations, onReset }) {
  const [hfApiKey, setHfApiKey] = useState("")
  const [hfDatasetName, setHfDatasetName] = useState("")
  const [isExportingZIP, setIsExportingZIP] = useState(false)
  const [isExportingHF, setIsExportingHF] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFile: "" })
  const { toast } = useToast()

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
        const maskName = image.name.replace(/\.[^/.]+$/, "_mask.png")
        let maskCanvas
        if (annotation?.mask) {
          // convert mask dataURL to a Canvas, threshhold the canvas, blob it and save
          maskCanvas = await dataURLToCanvas(annotation.mask)
          maskCanvas = maskToBw(maskCanvas)
        } else {
          const imageCanvas = await dataURLToCanvas(image.dataUrl)
          maskCanvas = emptyMask(imageCanvas)
        }
        const maskBlob = await canvasToBlob(maskCanvas)
        zip.file(maskName, maskBlob)

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

      toast.success("Dataset downloaded successfully!")
      
    } catch (error) {
      toast.error("Error creating ZIP file: " + error.message)
    }

    setIsExportingZIP(false)
  }

  const uploadToHuggingFace = async () => {
    if (!hfApiKey || !hfDatasetName) {
      alert("Please provide HuggingFace API key and dataset name")
      return
    }

    // Calculate total files to upload
    const totalFiles =
      images.length + // original images
      1 // metadata.jsonl

    setUploadProgress({ current: 0, total: totalFiles})
    setIsExportingHF(true)

    try {
      const HF_SPLIT = "train/"

      if (await hf_hub.repoExists({
        repo: { type: "dataset", name: hfDatasetName },
        accessToken: hfApiKey,      
      })) {
        // Stop if repo exists
        toast.error("Dataset " + hfDatasetName + " already exists. Stop. We don't want to mess it up.")
        setIsExportingHF(false)

        return
      } else {
        // Create repo
        await hf_hub.createRepo({
          repo: { type: "dataset", name: hfDatasetName },
          accessToken: hfApiKey,
        });            
      }

      // Create metadata.jsonl 
      let metadataJsonl = "", imageCount = 0

      for (const image of images) {
        imageCount += 1
        const annotation = annotations[image.id]
        const prompt = annotation?.prompt || ""

        // Image 
        // const imageName = image.name.replace(/\.[^/.]+$/, "img_" + imageCount)
        const imageName = "IMG_" + imageCount + image.name.substring(image.name.lastIndexOf('.'));
        const imageBlob = await fetch(image.dataUrl).then((r) => r.blob())
        const imageFile = new File([imageBlob], HF_SPLIT + imageName, { type: imageBlob.type });

        // Mask, turn it to B/W before uploading
        const maskName = imageName.replace(/\.[^/.]+$/, "_mask.png")
        let maskCanvas
        if (annotation?.mask) {
          maskCanvas = await dataURLToCanvas(annotation.mask)
          maskCanvas = maskToBw(maskCanvas)
        } else {
          const imageCanvas = await dataURLToCanvas(image.dataUrl)
          maskCanvas = emptyMask(imageCanvas)
        }
        const maskBlob = await canvasToBlob(maskCanvas)
        const maskFile = new File([maskBlob], HF_SPLIT + maskName, { type: imageBlob.type });

        // Upload image and mask
        await hf_hub.uploadFile({
          repo: { type: "dataset", name: hfDatasetName },
          accessToken: hfApiKey,
          file: imageFile,
          // path: imageName - apparently ignored?
        });

        await hf_hub.uploadFile({
          repo: { type: "dataset", name: hfDatasetName },
          accessToken: hfApiKey,
          file: maskFile,
          // path: maskName - apparently ignored?
        });

        // Populate metadata
        const entry = {
          file_names: [imageName, maskName],
          image_file_name: imageName,
          mask_file_name: maskName,
          prompt: prompt,
        }
        metadataJsonl += JSON.stringify(entry) + "\n"

        setUploadProgress({ current: imageCount, total: totalFiles})
      }

      // Upload metadata.jsonl
      const metadataBlob = new Blob([metadataJsonl], { type: "text/jsonl" })
      const metadataFile = new File([metadataBlob], HF_SPLIT + "metadata.jsonl", { type: metadataBlob.type });

      await hf_hub.uploadFile({
        repo: { type: "dataset", name: hfDatasetName },
        accessToken: hfApiKey,
        file: metadataFile,
        // path: "train/metadata.jsonl" - apparently ignored?
      });

      setUploadProgress({ current: totalFiles, total: totalFiles})

    } catch (error) {
      setIsExportingHF(false)
      toast.error("Error uploading to HuggingFace: " + error.message)
    }

    toast.success("Dataset uploaded successfully!")
    setIsExportingHF(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
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

      <h3 className="text-lg font-medium mb-4">Export Dataset</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Download as ZIP</h4>
{/*            <HelpPopup title="ZIP Download">
              <p>
                <strong>What you'll get:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>
                  <code>images/</code> - Original uploaded images
                </li>
                <li>
                  <code>masks/</code> - Black/white mask files (PNG format)
                </li>
                <li>
                  <code>prompts.txt</code> - Text file with image captions
                </li>
              </ul>

              <p className="mt-3">
                <strong>File naming:</strong>
              </p>
              <p>Masks are named with "_mask" suffix. For example:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>
                  <code>photo.jpg</code> → <code>photo_mask.png</code>
                </li>
              </ul>
            </HelpPopup>*/}
          </div>
          <Button
            onClick={downloadAsZip}
            disabled={isExportingZIP || images.length === 0}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingZIP ? "Creating ZIP..." : "Download ZIP"}</span>
          </Button>
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
            {/* Upload Progress */}
            {isExportingHF && uploadProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Upload Progress</span>
                  <span className="text-gray-900 font-medium">
                    {uploadProgress.current} / {uploadProgress.total}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={uploadToHuggingFace}
              disabled={isExportingHF || isExportingZIP || !hfApiKey || !hfDatasetName}
              className="w-full px-4 py-2 bg-[#FF9D0B] text-white rounded-md hover:bg-[#D0A704]  flex items-center justify-center space-x-2"
            >
              {isExportingHF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {/*<Upload className="w-4 h-4" />*/}
              <span>{isExportingHF ? "Uploading..." : "Upload to HF"}</span>
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={onReset}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Project</span>
          </Button>          
        </div>
      </div>
    </div>
  )
}
