'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Upload } from 'lucide-react'
import Image from 'next/image'

export function ImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setPreview(URL.createObjectURL(e.target.files[0]))
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred')
      }
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: error.message || 'An error occurred while processing the image.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <Input id="dropzone-file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          {preview && (
            <div className="mt-4">
              <Image src={preview} alt="Preview" width={300} height={300} className="mx-auto rounded-lg" />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={!file || loading}>
            {loading ? 'Processing...' : 'Detect Pest'}
          </Button>
        </form>
        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold mb-2">Detection Result:</h3>
            {result.error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            ) : result.fallback ? (
              <Alert>
                <AlertTitle>Service Unavailable</AlertTitle>
                <AlertDescription>{result.detected} Our detection service is temporarily unavailable. Please try again later.</AlertDescription>
              </Alert>
            ) : (
              <>
                <p><strong>Detected:</strong> {result.detected}</p>
                <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
                <Alert variant={result.isPest ? "warning" : "info"}>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>{result.isPest ? 'Pest Detected' : 'Not a Pest'}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
                {result.isPest && (
                  <div className="space-y-2">
                    <p><strong>Pesticide Recommendation:</strong> {result.pesticide}</p>
                    <p><strong>Application Method:</strong> {result.applicationMethod}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

