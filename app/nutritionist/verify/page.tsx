"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState("pending")
  const router = useRouter()

  useEffect(() => {
    // Check current status
    fetch("/api/nutritionist/profile")
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          if (data.profile.verification_status === 'verified') {
            router.push("/nutritionist/dashboard") // Already verified? Go to dashboard.
          }
          setStatus(data.profile.verification_status)
        }
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert("Please select a file")

    setUploading(true)
    const formData = new FormData()
    formData.append("kndi_document", file)

    try {
      const res = await fetch("/api/nutritionist/submit-verification", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        setStatus("submitted")
        alert("Document uploaded successfully!")
      } else {
        alert("Upload failed. Please try again.")
      }
    } catch (err) {
      console.error(err)
      alert("Error uploading file.")
    } finally {
      setUploading(false)
    }
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded shadow max-w-md w-full text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
          <p className="text-gray-600">Your documents are under review by the Admin.</p>
          <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 underline">Check Status</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Verify Your Account</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Please upload your <strong>KNDI Certificate (PDF)</strong> to activate your nutritionist profile.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition cursor-pointer relative">
            <input 
              type="file" 
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              {file ? `Selected: ${file.name}` : "Click to select PDF file"}
            </p>
          </div>
          
          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Submit Verification"}
          </button>
        </form>
      </div>
    </div>
  )
}
