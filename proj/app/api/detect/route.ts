import { NextRequest, NextResponse } from 'next/server'

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224'
const MAX_RETRIES = 3
const INITIAL_BACKOFF = 1000 // 1 second
const CONFIDENCE_THRESHOLD = 0.5 // Minimum confidence level to consider a detection valid

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF): Promise<Response> {
  try {
    const response = await fetch(url, options)
    if (response.status === 503 && retries > 0) {
      console.log(`Received 503 error, retrying in ${backoff}ms...`)
      await new Promise(resolve => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch error: ${error.message}, retrying in ${backoff}ms...`)
      await new Promise(resolve => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    throw error
  }
}




export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const image = formData.get('image') as Blob | null

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  try {
    const imageBuffer = await image.arrayBuffer()

    console.log('Sending request to Hugging Face API...')
    const response = await fetchWithRetry(HUGGING_FACE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: Buffer.from(imageBuffer).toString('base64') }),
    })

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`)
      console.error('Response:', await response.text())
      
      if (response.status === 503) {
        console.log('Hugging Face API is unavailable, using fallback mechanism...')
        return NextResponse.json({
          detected: 'Unable to detect. Please try again later.',
          isPest: false,
          fallback: true
        })
      }
      
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()
    console.log('Hugging Face API response:', result)

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Unexpected response format from Hugging Face API')
    }

    const detectedLabel = result[0].label.toLowerCase()
    const confidence = result[0].score

    if (confidence < CONFIDENCE_THRESHOLD) {
      return NextResponse.json({
        detected: detectedLabel,
        confidence: confidence,
        isPest: false,
        message: 'Low confidence detection. Please try again with a clearer image.'
      })
    }

    const pestInfo = getPestInfo(detectedLabel)

    return NextResponse.json({
      detected: detectedLabel,
      confidence: confidence,
      isPest: pestInfo.isPest,
      pesticide: pestInfo.pesticide,
      applicationMethod: pestInfo.applicationMethod,
      message: pestInfo.message
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: `An error occurred while processing the image: ${error.message}` }, { status: 500 })
  }
}

function getPestInfo(detectedLabel: string): { 
  isPest: boolean; 
  pesticide: string; 
  applicationMethod: string;
  message: string;
} {
  const pests = {
    'armyworm': {
      isPest: true,
      pesticide: 'Bacillus thuringiensis (Bt)',
      applicationMethod: 'Spray on affected plants, especially in the evening',
      message: 'Armyworms are serious pests. Early detection and treatment is crucial.'
    },
    'beetle': {
      isPest: true,
      pesticide: 'Pyrethrin',
      applicationMethod: 'Spray directly on affected areas',
      message: 'Many beetle species can be pests. Identify the specific type for targeted treatment.'
    },
    'butterfly': {
      isPest: false,
      pesticide: 'Not recommended',
      applicationMethod: 'N/A',
      message: 'Most butterflies are beneficial insects and not considered pests.'
    },
    'moth': {
      isPest: true,
      pesticide: 'Spinosad',
      applicationMethod: 'Spray on affected plants in the evening',
      message: 'Some moth species can be pests, especially in their larval stage.'
    },
    'ant': {
      isPest: true,
      pesticide: 'Borax bait',
      applicationMethod: 'Place bait stations near ant trails',
      message: 'Ants can be pests in large numbers. Target the colony for effective control.'
    },
    'bee': {
      isPest: false,
      pesticide: 'Not recommended',
      applicationMethod: 'N/A',
      message: 'Bees are crucial pollinators. If a hive is problematic, contact a professional for relocation.'
    },
    'wasp': {
      isPest: true,
      pesticide: 'Deltamethrin',
      applicationMethod: 'Apply to nests in the evening',
      message: 'Wasps can be beneficial but may pose a threat near human activity.'
    },
    'fly': {
      isPest: true,
      pesticide: 'Imidacloprid',
      applicationMethod: 'Use in fly bait stations',
      message: 'Flies can be disease vectors. Maintain cleanliness to prevent infestations.'
    },
    'mosquito': {
      isPest: true,
      pesticide: 'Methoprene',
      applicationMethod: 'Apply to standing water sources',
      message: 'Mosquitoes can transmit diseases. Focus on eliminating breeding sites.'
    },
    'grasshopper': {
      isPest: true,
      pesticide: 'Carbaryl',
      applicationMethod: 'Spray on affected plants and surrounding areas',
      message: 'Grasshoppers can cause significant crop damage in large numbers.'
    },
    'cricket': {
      isPest: true,
      pesticide: 'Bifenthrin',
      applicationMethod: 'Apply around the perimeter of buildings',
      message: 'Crickets are generally harmless but can be a nuisance in large numbers.'
    },
    'cockroach': {
      isPest: true,
      pesticide: 'Fipronil',
      applicationMethod: 'Use in bait stations in dark, humid areas',
      message: 'Cockroaches can spread diseases. Thorough sanitation is key to control.'
    },
    // Add new pest: Aphid
    'aphid': {
      isPest: true,
      pesticide: 'Neem oil or insecticidal soap',
      applicationMethod: 'Spray directly on affected plants, covering both top and bottom of leaves',
      message: 'Aphids can quickly multiply and damage plants. Regular monitoring and early treatment is important.'
    }
  }

  // Check for exact matches first
  if (pests.hasOwnProperty(detectedLabel)) {
    return pests[detectedLabel];
  }

  // If no exact match, check for partial matches
  for (const [pest, info] of Object.entries(pests)) {
    if (detectedLabel.includes(pest)) {
      return info;
    }
  }

  // If still no match, check if it's an insect
  if (detectedLabel.includes('insect')) {
    return {
      isPest: true,
      pesticide: 'Consult an expert',
      applicationMethod: 'Depends on the specific insect',
      message: 'This appears to be an insect that might be a pest. For safe and effective treatment, consult with a local agricultural expert or entomologist.'
    };
  }

  // If no match at all
  return {
    isPest: false,
    pesticide: 'Not applicable',
    applicationMethod: 'N/A',
    message: 'This does not appear to be a pest.'
  }
}



