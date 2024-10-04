const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const app = express();
const port = 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, 'public')));

// Function to call Insect.id API
async function callInsectApi(imageData) {
    const apiPayload = {
        images: [imageData],
        similar_images: true
    };

    const response = await axios.post(
        'https://insect.kindwise.com/api/v1/identification',
        apiPayload,
        {
            headers: {
                'Api-Key': process.env.INSECT_ID_API_KEY,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
}

// Function to call pesticide recommendation API
async function callPesticideApi(bestSuggestion) {
    const prompt = `Provide 2 pesticides for ${bestSuggestion.name} in JSON with only name and description., return the arry json only  with structure [{name: "", description: ""}]`;
    const pesticideResponse = await axios({
        method: 'POST',
        url: 'https://api.aimlapi.com/chat/completions',
        headers: {
            Authorization: 'Bearer f6c68be970e646b0b7b6884f31c241ce', // Replace with your actual AI API key
            'Content-Type': 'application/json',
        },
        data: {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 50
        },
    });

    return pesticideResponse.data;
}

// Handle image upload and API call
app.post('/upload', upload.single('image'), async (req, res) => {
    const filePath = req.file.path;

    try {
        // Convert image to base64
        const imageData = fs.readFileSync(filePath, 'base64');

        // Call the Insect API
        const insectApiResponse = await callInsectApi(imageData);

        // Log the entire response to see its structure
        console.log('Insect API Response:', insectApiResponse);

        // Extract the best suggestion safely
        const suggestions = insectApiResponse.result.classification.suggestions;

        if (Array.isArray(suggestions) && suggestions.length > 0) {
            const bestSuggestion = suggestions[0]; // Safely access the first element

            // Call the pesticide recommendation API
            const pesticideResponse = await callPesticideApi(bestSuggestion);

            // Log the AI API response to check its format
            console.log('Pesticide API Response:', pesticideResponse);

            // Extract and parse pesticide recommendations
            let pesticideRecommendation;
            try {
                pesticideRecommendation = JSON.parse(pesticideResponse.choices[0].message.content);
            } catch (error) {
                console.warn('AI response not JSON, returning as string:', pesticideResponse.choices[0].message.content);
                pesticideRecommendation = { recommended_products: pesticideResponse.choices[0].message.content };
            }

            // Structure the final response
            return res.json({
                success: true,
                message: 'Image processed successfully.',
                data: {
                    access_token: insectApiResponse.access_token,
                    model_version: insectApiResponse.model_version,
                    input: {
                        image_file: req.file.originalname,
                        timestamp: new Date().toISOString(),
                    },
                    best_suggestion: {
                        name: bestSuggestion.name,
                        probability: bestSuggestion.probability,
                        description: bestSuggestion.description || 'No description available.',
                        images: bestSuggestion.images || [],
                    },
                    pesticide_recommendation: {
                        recommended_products: pesticideRecommendation.recommended_products || [],
                    },
                },
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'No suggestions found for the uploaded image.',
            });
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error processing image.' });
    }
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});