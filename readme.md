```markdown
# Weather Search Application

## Overview
This project is a web-based weather search application that allows users to retrieve and display weather data using the Tomorrow.io API. The application uses server-side scripting with Python (Flask), and the results are presented in a responsive and visually appealing format. The app incorporates JSON, AJAX, Highcharts, and other APIs for enhanced user experience.

## Features
1. **Search Functionality**:
   - Users can search weather information using street, city, and state inputs.
   - Alternatively, users can check a box to use their current location based on IP information.

2. **Weather Results**:
   - Displays weather results in a card and tabular format.
   - Includes detailed weather summaries and interactive charts.

3. **Responsive Design**:
   - Fully responsive layout suitable for both desktop and mobile devices.

4. **Highcharts Integration**:
   - Provides graphical representations of daily and hourly weather data.

5. **Cloud Deployment**:
   - The application is deployed using Microsoft Azure. Here's my azure link: https://msdocs-python-flask-webapp-quickstart-123-dbapd8ema6f2gycx.eastus-01.azurewebsites.net/

## Technologies Used
- **Backend**: Python with Flask.
- **Frontend**: HTML, CSS, JavaScript.
- **APIs**:
  - Tomorrow.io API for weather data.
  - Google Maps Geocoding API for location resolution.
  - IPinfo API for location detection.
- **Visualization**: Highcharts for dynamic charts.

## Setup and Installation

### Prerequisites
- Python 3.8+
- Flask
- API keys for:
  - Tomorrow.io
  - Google Maps Geocoding
  - IPinfo

### Steps to Run the Application
1. Clone the repository:
   ```bash
   git clone weather-app
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables for API keys in a `.env` file:
   ```
   TOMORROW_IO_API_KEY=your_api_key
   GOOGLE_API_KEY=your_api_key
   IPINFO_TOKEN=your_token
   ```

4. Run the Flask application:
   ```bash
   python main.py
   ```

5. Open the application in a web browser:
   ```
   http://localhost:5000
   ```

## Usage
1. Navigate to the application URL.
2. Input search details (Street, City, State) or select the "Use My Location" checkbox.
3. View weather results in the card and table format.
4. Explore detailed weather summaries and charts by clicking on specific dates.

## API References
- [Tomorrow.io API](https://docs.tomorrow.io/reference/welcome)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start)
- [IPinfo API](https://ipinfo.io/)

## Important Notes
- All API calls to Tomorrow.io must go through the Python backend.
- Ensure the application's appearance matches the provided reference designs and videos.
- Deploy the entire application on a single cloud platform. GitHub Pages should not be used for hosting.

## Submission Guidelines
1. Host your files on GCP, AWS, or Azure and provide the live link.
2. Submit a ZIP file containing:
   - Frontend files (HTML, CSS, JS).
   - Backend files (Python scripts, `requirements.txt`, `.yaml`).
3. Ensure the project follows the structure outlined in the documentation.

---