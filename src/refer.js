const axios = require('axios');

const insectName = "Romalea microptera";
axios({
  method: 'POST',
  url: 'https://api.aimlapi.com/chat/completions',
  headers: {
    Authorization: 'Bearer f6c68be970e646b0b7b6884f31c241ce',
    'Content-Type': 'application/json',
  },
  data: {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Suggest 3 pesticides for ${insectName} in the following JSON format:
        {
          "pesticides": [
            {
              "name": "string",
              "description": "string"
            }
          ]
        }`,
      },
    ],
    max_tokens: 150,
    stream: false,
  },
})
  .then((response) => {
    let jsonResponse = response.data.choices[0].message.content;

    // Remove any code block formatting
    jsonResponse = jsonResponse.replace(/```json|```/g, '').trim();

    console.log(JSON.parse(jsonResponse));
  })
  .catch((error) => {
    console.error(error);
  });