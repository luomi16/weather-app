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

# sample additional link
@app.route('/api/search', methods=['get'])
def api_search():
    try:
        lat = 39.9524 
        lon = -75.1636
        weather_url = f"https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=current,1d,1h&units=imperial&apikey={TOMORROW_API_KEY}"
        weather_response = requests.get(weather_url).json()
        
        weather_response['latitude'] = lat
        weather_response['longitude'] = lon
        
        return jsonify(weather_response)
    
    except Exception as e:
        app.logger.error(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        
        if data.get('use_current_location'):
            # Use IPInfo to get location
            ip_info = requests.get(f'https://ipinfo.io?token={IPINFO_TOKEN}').json()
            lat, lon = ip_info['loc'].split(',')
            location = f"{ip_info['city']}, {ip_info['region']}, {ip_info['country']}"
        else:
            # Use Google Geocoding API
            address = f"{data['street'].strip()}, {data['city'].strip()}, {data['state'].strip()}"
            encoded_address = quote_plus(address)
            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={encoded_address}&key={GOOGLE_API_KEY}"
            geocode_response = requests.get(geocode_url).json()
            
            if geocode_response['status'] != 'OK':
                return jsonify({'error': 'Unable to find location'}), 400
            
            lat = geocode_response['results'][0]['geometry']['location']['lat']
            lon = geocode_response['results'][0]['geometry']['location']['lng']
            location = geocode_response['results'][0]['formatted_address']
    
        # Call Tomorrow.io API
        weather_url = f"https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=current,1d,1h&units=imperial&apikey={TOMORROW_API_KEY}"
        weather_response = requests.get(weather_url).json()
        weather_response['location'] = location
        weather_response['latitude'] = lat
        weather_response['longitude'] = lon
        
        return jsonify(weather_response)
    
    except Exception as e:
        app.logger.error(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/detailed-weather', methods=['GET'])
def detailed_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    weather_url = f"https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=current,1d,1h&units=imperial&apikey={TOMORROW_API_KEY}"
    weather_response = requests.get(weather_url).json()
    return jsonify(weather_response)

if __name__ == '__main__':
    app.run(debug=True)
