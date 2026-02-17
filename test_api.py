import requests
import json

url = "http://127.0.0.1:5000/api/predict"
payload = {
    "zone_id": 1,
    "date": "2024-10-12",
    "time_window": "Afternoon (2-6 PM)"
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
