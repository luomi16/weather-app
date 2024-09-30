/my_flask_app
    ├── app/
    │   ├── __init__.py
    │   ├── routes.py
    │   ├── models.py
    │   ├── forms.py
    │   ├── templates/
    │   │   ├── base.html
    │   │   ├── index.html
    │   │   └── other_templates.html
    │   ├── static/
    │   │   ├── css/
    │   │   ├── js/
    │   │   └── images/
    │   ├── main/
    │   │   ├── __init__.py
    │   │   ├── routes.py
    │   │   ├── errors.py
    │   │   └── forms.py
    │   └── extensions.py
    ├── config.py
    ├── requirements.txt
    ├── run.py
    └── migrations/


# 创建虚拟环境

python -m venv venv

# 激活虚拟环境

# 在 Windows 上：

venv\Scripts\activate

# 安装所有依赖

pip install -r requirements.txt
将安装的依赖写入 requirements.txt 以便后续部署使用：
pip freeze > requirements.txt

# Weather Search Application

This project is a web application that allows users to search for weather information by location. It uses the Tomorrow.io API for weather data, Google Maps API for geocoding, and IPInfo for IP-based location detection.

## Features

- Search weather by street, city, and state
- Option to use current location for weather search
- Display current weather conditions
- Show temperature range chart
- Display hourly weather forecast chart
- Responsive design

## Technologies Used

- Backend: Python with Flask
- Frontend: HTML, CSS, JavaScript
- APIs: Tomorrow.io, Google Maps Geocoding, IPInfo
- Charts: Highcharts

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Python 3.7+
- pip (Python package manager)
- API keys for Tomorrow.io, Google Maps, and IPInfo

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/weather-search-app.git
   cd weather-search-app
   ```

2. Create a virtual environment and activate it:

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:

   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables for your API keys:
   ```
   export TOMORROW_API_KEY='your_tomorrow_api_key'
   export GOOGLE_API_KEY='your_google_api_key'
   export IPINFO_TOKEN='your_ipinfo_token'
   ```
   Note: On Windows, use `set` instead of `export`.

## Usage

1. Start the Flask application:

   ```
   python app.py
   ```

2. Open a web browser and navigate to `http://localhost:5000`

3. Enter a location or use your current location to search for weather information

## Project Structure

- `app.py`: Main Flask application file
- `templates/`: HTML templates
  - `index.html`: Main page template
- `static/`: Static files (CSS, JavaScript)
  - `style.css`: Main stylesheet
  - `script.js`: Main JavaScript file
- `requirements.txt`: Python dependencies

## API Key Setup

To use this application, you need to obtain API keys from the following services:

1. [Tomorrow.io](https://www.tomorrow.io/): Sign up and get an API key for weather data
2. [Google Maps Platform](https://developers.google.com/maps): Create a project and enable the Geocoding API
3. [IPInfo](https://ipinfo.io/): Sign up for a token to use their geolocation service

After obtaining these keys, set them as environment variables as described in the Installation section.

## Contributing

Contributions to this project are welcome. Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to Tomorrow.io for providing weather data
- Thanks to Google for their Geocoding API
- Thanks to IPInfo for their geolocation service
- Highcharts for the charting library
