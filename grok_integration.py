import os
import json
import logging
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for more detailed logging
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Grok3Client:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Initialize API configuration
        self.api_key = os.getenv('GROK_API_KEY')
        self.api_endpoint = os.getenv('GROK_API_ENDPOINT', 'https://api.x.ai/v1/chat/completions')
        
        if not self.api_key:
            raise ValueError("GROK_API_KEY environment variable is not set")
        
        logger.debug(f"Using API endpoint: {self.api_endpoint}")
        
        # Set up headers
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.debug(f"Headers configured: {json.dumps(self.headers, indent=2)}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def complete(self, prompt: str) -> Dict[str, Any]:
        """
        Send a completion request to the Grok3 API.
        
        Args:
            prompt (str): The input prompt for the model
            
        Returns:
            Dict[str, Any]: The API response
            
        Raises:
            requests.exceptions.RequestException: If the API request fails
        """
        # Prepare the request payload
        payload = {
            'model': 'grok-3',
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        }
        
        logger.info(f"Sending request to Grok3 API with payload: {json.dumps(payload, indent=2)}")
        
        try:
            response = requests.post(
                self.api_endpoint,
                headers=self.headers,
                json=payload,
                timeout=120  # 2 minutes timeout
            )
            
            # Log detailed response information
            logger.debug(f"Response status code: {response.status_code}")
            logger.debug(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
            logger.debug(f"Response text: {response.text}")
            
            if response.status_code != 200:
                logger.error(f"Error response from API: {response.text}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            if hasattr(e.response, 'text'):
                logger.error(f"Error response body: {e.response.text}")
            raise

def main():
    try:
        # Initialize Grok3 client
        grok = Grok3Client()
        
        # Example prompt
        prompt = "Write a function that calculates the Fibonacci sequence."
        
        # Send request and get response
        response = grok.complete(prompt)
        
        # Process the response
        if 'choices' in response and len(response['choices']) > 0:
            message = response['choices'][0]['message']
            print(f"\nGrok3 Response:\n{message['content']}")
        else:
            print("\nNo response content found in the API response")
            
    except Exception as e:
        logger.error(f"Failed to process request: {str(e)}")
        raise

if __name__ == "__main__":
    main() 