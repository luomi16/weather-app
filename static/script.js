document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const clearButton = document.getElementById("clear-button");

  const useCurrentLocationCheckbox = document.getElementById("auto-detect");

  const resultsContainer = document.getElementById("results-container");

  const weatherCodeMapping = {
    1000: {
      description: "Clear Day",
      iconUrl: "/static/images/Weather_icons/clear_day.svg",
    },
    1100: {
      description: "Mostly Clear Day",
      iconUrl: "/static/images/Weather_icons/mostly_clear_day.svg",
    },
    1101: {
      description: "Partly Cloudy Day",
      iconUrl: "/static/images/Weather_icons/partly_cloudy_day.svg",
    },
    1102: {
      description: "Mostly Cloudy",
      iconUrl: "/static/images/Weather_icons/mostly_cloudy.svg",
    },
    1001: {
      description: "Cloudy",
      iconUrl: "/static/images/Weather_icons/cloudy.svg",
    },
    4200: {
      description: "Light Rain",
      iconUrl: "/static/images/Weather_icons/rain_light.svg",
    },
    5000: {
      description: "Snow",
      iconUrl: "/static/images/Weather_icons/snow.svg",
    },
    6000: {
      description: "Freezing Drizzle",
      iconUrl: "/static/images/Weather_icons/freezing_drizzle.svg",
    },
    6001: {
      description: "Freezing Rain",
      iconUrl: "/static/images/Weather_icons/freezing_rain.svg",
    },
    7000: {
      description: "Strong Wind",
      iconUrl: "/static/images/Weather_icons/strong-wind.png",
    },
    7101: {
      description: "Wind",
      iconUrl: "/static/images/Weather_icons/wind.png",
    },
    8000: {
      description: "Thunderstorm",
      iconUrl: "/static/images/Weather_icons/tstorm.svg",
    },
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const searchData = Object.fromEntries(formData);

    if (useCurrentLocationCheckbox.checked) {
      searchData.use_current_location = true;
      delete searchData.street;
      delete searchData.city;
      delete searchData.state;
    } else {
      searchData.use_current_location = false;
    }

    try {
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });
      const data = await response.json();
      displayResults(data);
    } catch (error) {
      console.error("Error:", error);
      resultsContainer.innerHTML =
        "<p>An error occurred. Please try again.</p>";
    }
  });

  clearButton.addEventListener("click", () => {
    form.reset();
    resultsContainer.innerHTML = "";
  });

  useCurrentLocationCheckbox.addEventListener("change", () => {
    const inputs = form.querySelectorAll('input[type="text"], select');
    inputs.forEach((input) => {
      input.disabled = useCurrentLocationCheckbox.checked;
    });
  });

  function displayResults(data) {
    console.log("Displaying results for:", data);

    if (!data || !data.data || !data.data.timelines) {
      resultsContainer.innerHTML =
        "<p>Error: Invalid data received from the server.</p>";
      return;
    }

    // resultsContainer.innerHTML = '';

    const currentTimeline = data.data.timelines.find(
      (timeline) => timeline.timestep === "current"
    );
    if (currentTimeline && currentTimeline.intervals.length > 0) {
      const currentWeather = createCurrentWeatherCard({
        ...currentTimeline.intervals[0],
        address: data.location,
      });
      resultsContainer.appendChild(currentWeather);
    } else {
      resultsContainer.innerHTML +=
        "<p>Current weather data is not available.</p>";
    }

    const dailyTimeline = data.data.timelines.find(
      (timeline) => timeline.timestep === "1d"
    );

    if (dailyTimeline && dailyTimeline.intervals.length > 0) {
      createDailyWeatherTable(dailyTimeline.intervals);
    } else {
      resultsContainer.innerHTML +=
        "<p>Daily weather data is not available.</p>";
    }

    const chartsContainer = document.createElement("div");
    chartsContainer.className = "weather-charts";
    chartsContainer.innerHTML = `
        <button id="toggle-charts">▼ Show Weather Charts</button>
        <div id="charts-container" style="display: none;">
            <div id="temperature-chart"></div>
            <div id="hourly-chart"></div>
        </div>
    `;
    resultsContainer.appendChild(chartsContainer);

    initializeCharts(data);

    const toggleButton = document.getElementById("toggle-charts");
    const chartsDiv = document.getElementById("charts-container");
    toggleButton.addEventListener("click", () => {
      if (chartsDiv.style.display === "none") {
        chartsDiv.style.display = "block";
        toggleButton.textContent = "▲ Hide Weather Charts";
      } else {
        chartsDiv.style.display = "none";
        toggleButton.textContent = "▼ Show Weather Charts";
      }
    });
  }

  function getWeatherDescriptionAndIcon(weatherCode) {
    const mapping = weatherCodeMapping[weatherCode];
    if (mapping) {
      return mapping;
    } else {
      return {
        description: "Unknown",
        iconUrl: "",
      };
    }
  }

  function createCurrentWeatherCard(currentData) {
    console.log("Received currentData:", currentData);
    const card = document.createElement("div");
    card.className = "weather-card";

    if (!currentData || !currentData.values) {
      card.innerHTML = "<p>Error: Current weather data is not available.</p>";
      return card;
    }

    const values = currentData.values;

    const { description, iconUrl } = getWeatherDescriptionAndIcon(
      values.weatherCode
    );
    card.innerHTML = `
        <div class="weather-location">
            <p>${currentData.address || "Unknown Location"}</p>
        </div>
        <div class="weather-header">
            <div class="weather-icon">
                <img src="${iconUrl}" alt="${description}" class="weather-icon-image">
                <span class="weather-description">${description}</span>
            </div>
            <p>${
              values.temperature ? values.temperature.toFixed(1) + "°" : "N/A"
            }</p>
        </div>
        <div class="weather-details">
            <div class="weather-item">
                <span>Humidity</span>
                <img src="/static/images/icons/humidity.png" alt="Humidity" />
                <p class="weather-value">${values.humidity}</p>
            </div>
            <div class="weather-item">
                <span>Pressure</span>
                <img src="/static/images/icons/pressure.png" alt="Pressure" />
                <p class="weather-value">${
                  values.pressureSeaLevel
                    ? values.pressureSeaLevel + "inHg"
                    : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>Wind Speed</span>
                <img src="/static/images/icons/wind_speed.png" alt="Wind Speed" />
                <p class="weather-value">${
                  values.windSpeed
                    ? values.windSpeed.toFixed(1) + " mph"
                    : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>Visibility</span>
                <img src="/static/images/icons/visibility.png" alt="Visibility" />
                <p class="weather-value">${
                  values.visibility
                    ? values.visibility.toFixed(2) + " mi"
                    : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>Cloud Cover</span>
                <img src="/static/images/icons/cloud_cover.png" alt="Cloud Cover" />
                <p class="weather-value">${
                  values.cloudCover ? values.cloudCover + "%" : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>UV Level</span>
                <img src="/static/images/icons/UV_Level.png" alt="UV Level" />
                <p class="weather-value">${values.uvIndex}</p>
            </div>
        </div>
    `;
    return card;
  }

  function createDailyWeatherTable(dailyData) {
    const tableContainer = document.createElement("div");
    tableContainer.className = "weather-table-container";

    // 创建表格的 HTML 结构
    const table = document.createElement("table");
    table.className = "weather-table";

    // 表头部分
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Temp High</th>
                <th>Temp Low</th>
                <th>Wind Speed</th>
            </tr>
        </thead>
        <tbody>
            ${dailyData
              .map((day, index) => {
                const date = new Date(day.startTime).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

                const { description, iconUrl } = getWeatherDescriptionAndIcon(
                  day.values.weatherCode
                );

                const weatherIcon = `
                        <div class="weather-status">
                            <img class="weather-icon" src="${iconUrl}" alt="${description}">
                            <p>${description}</p>
                        </div>
                    `;

                return `
                        <tr>
                            <td class="clickable-date" data-index="${index}">${date}</td>
                            <td>${weatherIcon}</td>
                            <td>${day.values.temperatureMax.toFixed(2)}</td>
                            <td>${day.values.temperatureMin.toFixed(2)}</td>
                            <td>${day.values.windSpeed.toFixed(2)}</td>
                        </tr>
                    `;
              })
              .join("")}
        </tbody>
    `;

    tableContainer.appendChild(table);
    document.getElementById("results-container").appendChild(tableContainer);

    const dateCells = document.querySelectorAll(".clickable-date");
    dateCells.forEach((cell) => {
      cell.addEventListener("click", (event) => {
        const index = event.target.dataset.index;
        if (index !== undefined) {
          fetchAndDisplayDailyDetails(dailyData[index]);
        }
      });
    });
  }

  function fetchAndDisplayDailyDetails(dayData) {
    const lat = 34.0223519;
    const lon = -118.285117;
    // const lat = dayData.latitude;
    // const lon = dayData.longitude;

    fetch(`/detailed-weather?lat=${lat}&lon=${lon}`)
      .then((response) => response.json())
      .then((data) => {
        displayDailyWeatherDetails(data, dayData.startTime);
      })
      .catch((error) => {
        console.error("Error fetching daily weather details:", error);
      });
  }

  function displayDailyWeatherDetails(data, startTime) {
    console.log("data", data);
    console.log("startTime", startTime);

    const weatherDetails = data.timelines[0].intervals[0].values;
    console.log(weatherDetails);

    const date = new Date(startTime).toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    console.log("date", date);

    const { description, iconUrl } = getWeatherDescriptionAndIcon(
      weatherDetails.weatherCode
    );

    const detailsContainer = document.getElementById(
      "detailed-weather-container"
    );
    detailsContainer.innerHTML = `
        <div class="daily-weather-card">
            <h2>Daily Weather Details</h2>
            <div class="weather-header">
                <p>${date}</p>
                <img src="${iconUrl}" alt="${description}" class="weather-icon-image">
                <p>${description}</p>
            </div>
            <div class="temperature">
                ${weatherDetails.temperatureMax.toFixed(
                  1
                )}°F / ${weatherDetails.temperatureMin.toFixed(1)}°F
            </div>
            <div class="additional-details">
                <p>Precipitation: ${weatherDetails.precipitation || "N/A"}</p>
                <p>Chance of Rain: ${
                  weatherDetails.precipitationProbability || "0%"
                }%</p>
                <p>Wind Speed: ${weatherDetails.windSpeed.toFixed(1)} mph</p>
                <p>Humidity: ${weatherDetails.humidity.toFixed(1)}%</p>
                <p>Visibility: ${weatherDetails.visibility.toFixed(2)} mi</p>
                <p>Sunrise/Sunset: ${weatherDetails.sunriseTime || "N/A"} / ${
      weatherDetails.sunsetTime || "N/A"
    }</p>
            </div>
        </div>
    `;
  }

  function initializeCharts(data) {
    // console.log('Received data:', data);

    const dailyTimeline = data.data.timelines.find(
      (timeline) => timeline.timestep === "1d"
    );
    const currentTimeline = data.data.timelines.find(
      (timeline) => timeline.timestep === "current"
    );

    if (!dailyTimeline || !currentTimeline) {
      console.error("Required data is missing");
      return;
    }

    const dailyData = dailyTimeline.intervals;
    const currentData = currentTimeline.intervals[0];

    Highcharts.chart("temperature-chart", {
      chart: {
        type: "arearange",
        zoomType: "x",
        scrollablePlotArea: {
          minWidth: 600,
          scrollPositionX: 1,
        },
      },
      title: {
        text: "Temperature Range (Min, Max)",
      },
      xAxis: {
        type: "datetime",
        dateTimeLabelFormats: {
          day: "%e %b",
        },
      },
      yAxis: {
        title: {
          text: "Temperature (°F)",
        },
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        valueSuffix: "°F",
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Temperature",
          data: dailyData.map((day) => [
            new Date(day.startTime).getTime(),
            day.values.temperatureMin,
            day.values.temperatureMax,
          ]),
        },
      ],
    });

    Highcharts.chart("hourly-chart", {
      chart: {
        zoomType: "xy",
      },
      title: {
        text: "Daily Weather",
      },
      xAxis: [
        {
          type: "datetime",
          dateTimeLabelFormats: {
            day: "%e %b",
          },
        },
      ],
      yAxis: [
        {
          title: {
            text: "Temperature (°F)",
            style: {
              color: Highcharts.getOptions().colors[1],
            },
          },
          opposite: true,
        },
        {
          title: {
            text: "Precipitation Probability (%)",
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          max: 100,
        },
      ],
      tooltip: {
        shared: true,
      },
      series: [
        {
          name: "Precipitation Probability",
          type: "column",
          yAxis: 1,
          data: dailyData.map((day) => [
            new Date(day.startTime).getTime(),
            day.values.precipitationProbability,
          ]),
          tooltip: {
            valueSuffix: " %",
          },
        },
        {
          name: "Temperature",
          type: "spline",
          data: dailyData.map((day) => [
            new Date(day.startTime).getTime(),
            day.values.temperature,
          ]),
          tooltip: {
            valueSuffix: " °F",
          },
        },
      ],
    });
  }
});
