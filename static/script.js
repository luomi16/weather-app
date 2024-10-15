document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const clearButton = document.getElementById("clear-button");

  const useCurrentLocationCheckbox = document.getElementById("auto-detect");

  const resultsContainer = document.getElementById("results-container");
  const detailsContainer = document.getElementById(
    "detailed-weather-container"
  );

  const weatherCodeMapping = {
    1000: {
      description: "Clear",
      iconUrl: "/static/images/Weather_icons/clear_day.svg",
    },
    1100: {
      description: "Mostly Clear",
      iconUrl: "/static/images/Weather_icons/mostly_clear_day.svg",
    },
    1101: {
      description: "Partly Cloudy",
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
    detailsContainer.innerHTML = "";
    location.reload();
  });

  useCurrentLocationCheckbox.addEventListener("change", () => {
    const inputs = form.querySelectorAll('input[type="text"], select');
    inputs.forEach((input) => {
      input.disabled = useCurrentLocationCheckbox.checked;
    });
  });

  function displayResults(data) {
    if (!data || !data.data || !data.data.timelines) {
      resultsContainer.innerHTML = "<p>Error: 500 (INTERNAL SERVER ERROR)</p>";
      return;
    }

    resultsContainer.innerHTML = "";

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

    const lat = data.latitude;
    const lon = data.longitude;

    if (dailyTimeline && dailyTimeline.intervals.length > 0) {
      createDailyWeatherTable(lat, lon, dailyTimeline.intervals);
    } else {
      resultsContainer.innerHTML +=
        "<p>Daily weather data is not available.</p>";
    }
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
                <img src="/static/images/icons/Pressure.png" alt="Pressure" />
                <p class="weather-value">${
                  values.pressureSeaLevel
                    ? values.pressureSeaLevel + "inHg"
                    : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>Wind Speed</span>
                <img src="/static/images/icons/Wind_Speed.png" alt="Wind Speed" />
                <p class="weather-value">${
                  values.windSpeed
                    ? values.windSpeed.toFixed(1) + " mph"
                    : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>Visibility</span>
                <img src="/static/images/icons/Visibility.png" alt="Visibility" />
                <p class="weather-value">${
                  values.visibility
                    ? values.visibility.toFixed(2) + " mi"
                    : "N/A"
                }</p>
            </div>
            <div class="weather-item">
                <span>Cloud Cover</span>
                <img src="/static/images/icons/Cloud_Cover.png" alt="Cloud Cover" />
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

  function createDailyWeatherTable(lat, lon, dailyData) {
    const tableContainer = document.createElement("div");
    tableContainer.className = "weather-table-container";

    const table = document.createElement("table");
    table.className = "weather-table";

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
                            <img class="daily-weather-icon" src="${iconUrl}" alt="${description}">
                            <p>${description}</p>
                        </div>
                    `;

                return `
                        <tr>
                            <td class="clickable-date" data-index="${index}">${date}</td>
                            <td class="clickable-date" data-index="${index}">${weatherIcon}</td>
                            <td class="clickable-date" data-index="${index}">${day.values.temperatureMax.toFixed(
                  2
                )}</td>
                            <td class="clickable-date" data-index="${index}">${day.values.temperatureMin.toFixed(
                  2
                )}</td>
                            <td class="clickable-date" data-index="${index}">${day.values.windSpeed.toFixed(
                  2
                )}</td>
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
          fetchAndDisplayDailyDetails(lat, lon, dailyData[index]);
        }
      });
    });
  }

  function fetchAndDisplayDailyDetails(lat, lon, dayData) {
    // console.log(dayData);
    resultsContainer.style.display = "none";

    fetch(`/detailed-weather?lat=${lat}&lon=${lon}&timestep=1h`)
      .then((response) => response.json())
      .then((data) => {
        displayDailyWeatherDetails(data, dayData.startTime);
        const chartsContainer = createChartsContainer();
        detailsContainer.appendChild(chartsContainer);

        initializeToggleCharts(chartsContainer);

        // console.log("data for charts", data)

        initializeCharts(data);
      })
      .catch((error) => {
        console.error("Error fetching daily weather details:", error);
      });
  }

  function formatTime(isoString) {
    if (!isoString) return "N/A";

    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  function displayDailyWeatherDetails(data, startTime) {
    const weatherDetails = data.data.timelines[0].intervals[0].values;
    // console.log("weatherDetails", weatherDetails);

    const date = new Date(startTime).toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const { description, iconUrl } = getWeatherDescriptionAndIcon(
      weatherDetails.weatherCode
    );

    const sunriseTimeFormatted = formatTime(weatherDetails.sunriseTime);
    const sunsetTimeFormatted = formatTime(weatherDetails.sunsetTime);

    detailsContainer.innerHTML = `
        <div class="detailed-daily-weather-card">
            <div class="detailed-weather-header">
                <div class="basic-info">
                    <p>${date}</p>
                    <p>${description}</p>
                    <div class="detailed-temperature">
                        ${weatherDetails.temperatureMax.toFixed(
                          1
                        )}°F / ${weatherDetails.temperatureMin.toFixed(1)}°F
                    </div>
                </div>
                <img src="${iconUrl}" alt="${description}" class="detailed-weather-icon-image">
            </div>
            
            <div class="additional-details">
                <p>Precipitation: ${weatherDetails.precipitation || "N/A"}</p>
                <p>Chance of Rain: ${
                  weatherDetails.precipitationProbability || "0"
                }%</p>
                <p>Wind Speed: ${weatherDetails.windSpeed.toFixed(1)} mph</p>
                <p>Humidity: ${weatherDetails.humidity.toFixed(1)}%</p>
                <p>Visibility: ${weatherDetails.visibility.toFixed(2)} mi</p>
                <p>Sunrise/Sunset: ${sunriseTimeFormatted} / ${sunsetTimeFormatted}</p>
            </div>
        </div>
    `;
  }

  function initializeToggleCharts(chartsContainer) {
    const toggleButton = chartsContainer.querySelector("#toggle-charts");
    const chartsDiv = chartsContainer.querySelector("#charts-container");

    toggleButton.addEventListener("click", () => {
      if (chartsDiv.style.display === "none") {
        chartsDiv.style.display = "block";
        toggleButton.textContent = "▲ Weather Charts";
      } else {
        chartsDiv.style.display = "none";
        toggleButton.textContent = "▼ Weather Charts";
      }
    });
  }

  function createChartsContainer() {
    const chartsContainer = document.createElement("div");
    chartsContainer.className = "weather-charts";
    chartsContainer.innerHTML = `
        <button id="toggle-charts">▼ Weather Charts</button>
        <div id="charts-container" style="display: none;">
            <div id="temperature-chart"></div>
            <div id="hourly-chart"></div>
        </div>
    `;
    return chartsContainer;
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
    // const currentData = currentTimeline.intervals[0];

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
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, "rgba(255, 165, 0, 0.3)"],
              [1, "rgba(135, 206, 235, 0.5)"],
            ],
          },
          lineColor: "#FFA500",
          marker: {
            enabled: true,
            radius: 4,
            fillColor: "#00aaff",
          },
        },
      ],
    });

    const hourlyTimeline = data.data.timelines.find(
      (timeline) => timeline.timestep === "1h"
    );

    if (!hourlyTimeline) {
      console.error("Hourly timeline data is missing");
      return;
    }

    const hourlyData = hourlyTimeline.intervals;

    Highcharts.chart("hourly-chart", {
      chart: {
        zoomType: "xy",
      },
      title: {
        text: "Hourly Weather (For Next 5 Days)",
      },
      xAxis: [
        // {
        //   type: "datetime",
        //   labels: {
        //     format: "{value: %A %b %e}",
        //     step: 2,
        //   },
        //   opposite: true,
        // },
        {
          type: "datetime",
          tickInterval: 36e5,
          labels: {
            format: "{value:%H}",
            step: 6,
          },
          crosshair: true,
          // opposite: false,
        },
      ],
      yAxis: [
        {
          title: {
            text: "Temperature (°F)",
          },
          labels: {
            format: "{value}°",
          },
          min: 0,
          max: 100,
          gridLineColor: "#e0e0e0",
          gridLineWidth: 1,
        },
        {
          title: {
            text: "Pressure (inHg)",
          },
          labels: {
            format: "{value}",
            style: {
              color: "#FFA500",
            },
          },
          opposite: true,
          min: 20,
          max: 40,
          gridLineWidth: 0,
        },
      ],
      tooltip: {
        shared: true,
      },
      series: [
        {
          name: "Humidity",
          type: "column",
          yAxis: 0,
          data: hourlyData.map((hour) => [
            new Date(hour.startTime).getTime(),
            hour.values.humidity,
          ]),
          tooltip: {
            valueSuffix: " %",
          },
          color: "rgba(135, 206, 235, 0.5)",
          borderColor: "#00aaff",
          borderWidth: 1,
          dataLabels: {
            enabled: true,
            formatter: function() {
              return this.point.index % 1 === 0 ? Math.round(this.y): '';
            },
            style: {
              color: "#000000",
            },
          },
        },
        {
          name: "Temperature",
          type: "spline",
          yAxis: 0,
          data: hourlyData.map((hour) => [
            new Date(hour.startTime).getTime(),
            Math.round(hour.values.temperature),
          ]),
          tooltip: {
            valueSuffix: " °F",
          },
          color: "#FF0000",
          lineWidth: 1,
        },
        {
          name: "Pressure",
          type: "spline",
          yAxis: 1,
          data: hourlyData.map((hour) => [
            new Date(hour.startTime).getTime(),
            hour.values.pressureSeaLevel,
          ]),
          tooltip: {
            valueSuffix: " inHg",
          },
          color: "#FFA500",
          // dashStyle: "ShortDot",
          lineWidth: 1,
        },
        {
          name: "Wind Speed",
          type: "windbarb",
          data: hourlyData
            .map((hour, index) => {
              return index % 2 === 0
                ? [
                    new Date(hour.startTime).getTime(),
                    hour.values.windSpeed,
                    hour.values.windDirection,
                  ]
                : null;
            })
            .filter(Boolean),
          vectorLength: 10,
          color: "#0000FF",
          tooltip: {
            valueSuffix: " mph",
          },
        },
      ],
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
      },
    });
  }
});
