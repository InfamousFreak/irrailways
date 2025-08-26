'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function CablePlanUploadPage() {
  // useState hook to manage the selected file for upload.
  const [selectedFile, setSelectedFile] = useState(null);
  // useState hook to track the loading state during upload.
  const [isUploading, setIsUploading] = useState(false);
  // useState hook for the plan name input.
  const [planName, setPlanName] = useState("");

  /**
   * Handles the file input change event.
   * @param {React.ChangeEvent<HTMLInputElement>} event The file input change event.
   */
  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  /**
   * Handles the form submission to upload the file.
   * @param {React.FormEvent<HTMLFormElement>} event The form submission event.
   */
  const handleSubmit = async (event) => {
    // Prevent the default form submission behavior which reloads the page.
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    if (!planName.trim()) {
      alert("Please enter a plan name.");
      return;
    }

    setIsUploading(true);

    // FormData is a standard browser API to build form data programmatically.
    // It's required for sending files in a fetch request.
    const formData = new FormData();
    // Append the selected file. The key 'plan-file' must match the key
    // expected by the multer middleware on the backend.
    formData.append("plan-file", selectedFile);
    // Append the plan name.
    formData.append("planName", planName);

    try {
      // Use the fetch API to send a POST request to the backend upload endpoint.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // If the server responds with an error status, throw an error.
        throw new Error(result.message || "Something went wrong");
      }
      
      alert(result.message);
      // Reset form fields after successful upload
      setPlanName("");
      setSelectedFile(null);
      // This is a common way to reset the visual state of a file input
      if (document.getElementById('plan-file')) {
        document.getElementById('plan-file').value = '';
      }

    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      // Set uploading state back to false regardless of success or failure.
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Cable Plan</CardTitle>
          <CardDescription>
            Upload new or updated KML cable plan documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Use the onSubmit handler for the form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input 
                id="plan-name" 
                placeholder="e.g., 'West Corridor Section 5 Update'" 
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-file">Cable Plan File (KML)</Label>
              <Input id="plan-file" type="file" accept=".kml" onChange={handleFileChange} required />
            </div>
            <div className="flex justify-end">
              {/* Disable the button when an upload is in progress */}
              <Button type="submit" disabled={isUploading || !selectedFile || !planName}>
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
