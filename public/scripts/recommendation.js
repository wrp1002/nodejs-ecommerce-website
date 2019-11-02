$(document).ready(function() {
    $.ajax({
          url: "https://api.openweathermap.org/data/2.5/weather?q=wellington&units=metric&APPID=426f191c9f83c393f9b782868641905d",
          type: 'GET',
          success: function(data) {
            weatherDescription = data.weather[0].description;
            weatherTemp = data.main.temp;

            $.ajax({
                url: "/recommendation",
                type: 'GET',
                data: {weatherDescription: weatherDescription, weatherTemp: weatherTemp},
                success: function(data) {
                  $("#weather").html(data);
                }
            });
          }
      });
  })