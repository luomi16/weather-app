from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import os
import logging
from datetime import datetime
from urllib.parse import quote_plus

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

# API keys
TOMORROW_API_KEY = os.environ.get('TOMORROW_API_KEY')
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
IPINFO_TOKEN = os.environ.get('IPINFO_TOKEN')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    
    if data.get('use_current_location'):
        # Use IPInfo to get location
        ip_info = requests.get(f'https://ipinfo.io?token={IPINFO_TOKEN}').json()
        lat, lon = ip_info['loc'].split(',')
        location = f"{ip_info['city']}, {ip_info['region']}, {ip_info['country']}"
    else:
        # Use Google Geocoding API
        # address = f"{data['street']}, {data['city']}, {data['state']}"
        address = f"{data['street'].strip()}, {data['city'].strip()}, {data['state'].strip()}"
        encoded_address = quote_plus(address)
        geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={encoded_address}&key={GOOGLE_API_KEY}"
        # geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}"
        geocode_response = requests.get(geocode_url).json()
        # print("address", address)
        
        if geocode_response['status'] != 'OK':
            return jsonify({'error': 'Unable to find location'}), 400
        
        lat = geocode_response['results'][0]['geometry']['location']['lat']
        lon = geocode_response['results'][0]['geometry']['location']['lng']
        location = geocode_response['results'][0]['formatted_address']
        # print(lat, lon)
        # 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA

    # lat = 34.0223519
    # lon = -118.285117
    
    # Call Tomorrow.io API
    weather_url = f"https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=current,1d&units=imperial&apikey={TOMORROW_API_KEY}"
    weather_response = requests.get(weather_url).json()
    weather_response['location'] = location

    # print("weather_response", weather_response)
    
    return jsonify(weather_response)

@app.route('/detailed-weather', methods=['GET'])
def detailed_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    # 调用 Tomorrow.io API 获取详细天气信息
    weather_url = f"https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=current,1d&units=imperial&apikey={TOMORROW_API_KEY}"
    weather_response = requests.get(weather_url).json()

    print(weather_response)

    return jsonify(weather_response)

if __name__ == '__main__':
    app.run(debug=True)
