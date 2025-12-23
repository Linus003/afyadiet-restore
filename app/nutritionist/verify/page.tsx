"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NutritionistNav } from "@/components/nutritionist-nav";

export default function VerifyAccount() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // 1. Create FormData
      const formData = new FormData();
      formData.append("kndi_document", file); 

      // 2. Prepare Headers
      // We try to get the token, but we DO NOT stop if it's missing.
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 3. Send to API
      const res = await fetch("/api/nutritionist/submit-verification", {
        method: "POST",
        body: formData, 
        headers: headers,
        credentials: 'include', // <--- THIS IS THE CRITICAL FIX
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(true);
      setTimeout(() => router.push("/nutritionist/dashboard"), 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NutritionistNav />
      <div className="container mx-auto max-w-lg mt-20 px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verify Your Account</CardTitle>
            <CardDescription>
              Upload your KNDI Certificate (PDF) to activate your nutritionist profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-bold text-lg">Submission Received!</h3>
                <p>Your document is being reviewed. Redirecting...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Upload Box */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white hover:bg-gray-50 transition">
                  <input
                    type="file"
                    accept="application/pdf"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {file ? (
                      <div className="flex flex-col items-center text-blue-600">
                        <FileText className="w-10 h-10 mb-2" />
                        <span className="font-medium underline">{file.name}</span>
                        <span className="text-xs text-gray-500 mt-1">Click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="w-10 h-10 mb-2" />
                        <span className="font-medium">Click to select PDF</span>
                        <span className="text-xs mt-1">Max size: 4MB</span>
                      </div>
                    )}
                  </label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !file} 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                  ) : (
                    "Submit Verification"
                  )}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}