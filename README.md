# AI Sports Performance Coach
-------

Your own personalized coach able to guide your training through biometric data!

-------

This application interfaces with the OpenAI API and the WHOOP API to allow users to interact with 
their own AI agent. 

The idea for this stemmed from observing my teammates anxiety around our sport. The night of the Hackathon, we had a team 
meeting where our coach told us "If you feel anxious about this sport, then you need to reconsider why you play". 
Your sport is something that you should love, spend hours dreading every practice and game. This app was intended to help
athletes deal with anxiety or other problems.

When I realized Whoop had their own API that I could interface with, the project evolved from a simple therapist to a 
performance coach. The agent was now able to provide imperical biometric evidence and analysis with the WHOOP data. 


-------

To setup:

-Install dependancies
```npm install```

- ENV:
Create an env file containing the following:
OPENAI_API_KEY=your_openai_api_key_here

WHOOP_CLIENT_ID=your_whoop_client_id
WHOOP_CLIENT_SECRET=your_whoop_client_secret
WHOOP_REDIRECT_URI=http://localhost:3000/api/whoop/callback

-Run localhost
```npm run dev```
