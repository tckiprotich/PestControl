'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from 'lucide-react'
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
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
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

