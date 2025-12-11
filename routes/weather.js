// routes/weather.js

const express = require('express');
const request = require('request');

const router = express.Router();
const db = global.db;

// GET /weather
router.get('/', (req, res) => {
  res.render('weather', {
    city: null,
    weatherMessage: null,
    error: null,
    conditionMain: null,
    conditionDescription: null,
    joggingRecommendation: null,
    joggingQuest: null
  });
});

// POST /weather
router.post('/', (req, res, next) => {
  let city = req.body.city;
  city = req.sanitize(city);

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.render('weather', {
      city,
      weatherMessage: null,
      error: 'Weather API key not configured.',
      conditionMain: null,
      conditionDescription: null,
      joggingRecommendation: null,
      joggingQuest: null
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  request(url, (err, response, body) => {
    if (err) {
      return next(err);
    }
    try {
      const weather = JSON.parse(body);

      if (!weather || !weather.main || (weather.cod && weather.cod !== 200)) {
        return res.render('weather', {
          city,
          weatherMessage: null,
          error: 'No data found for that city.',
          conditionMain: null,
          conditionDescription: null,
          joggingRecommendation: null,
          joggingQuest: null
        });
      }

      const temp = weather.main.temp;
      const feelsLike = weather.main.feels_like;
      const wind = weather.wind.speed;
      const humidity = weather.main.humidity;

      const conditionMain =
        weather.weather && weather.weather[0] ? weather.weather[0].main : '';
      const conditionDescription =
        weather.weather && weather.weather[0] ? weather.weather[0].description : '';

      const weatherMessage =
        `It is ${temp}°C (feels like ${feelsLike}°C) in ${weather.name}. ` +
        `Wind: ${wind} m/s, humidity: ${humidity}%.`;

      // Simple “is this good for running?” logic
      let joggingRecommendation = '';
      const badConditions = ['Thunderstorm', 'Snow', 'Tornado'];
      const isRaining = conditionMain === 'Rain' || conditionMain === 'Drizzle';

      if (temp < 3 || temp > 30 || badConditions.includes(conditionMain)) {
        joggingRecommendation =
          'Conditions are not ideal for running outside. Consider an indoor workout instead.';
      } else if (isRaining) {
        joggingRecommendation =
          'It’s raining – you could still run if you’re happy to get wet, but be careful on slippery surfaces.';
      } else {
        joggingRecommendation =
          'This looks like good weather for a run. Perfect time to try the Medium Jogging Quest!';
      }

      const joggingQuestSql = 'SELECT id, name FROM quests WHERE name = ? LIMIT 1';
      db.query(joggingQuestSql, ['Medium Jogging Quest'], (qErr, qRows) => {
        if (qErr) {
          console.error('Error looking up jogging quest:', qErr);
        }

        const joggingQuest = qRows && qRows.length > 0 ? qRows[0] : null;

        res.render('weather', {
          city: weather.name,
          weatherMessage,
          error: null,
          conditionMain,
          conditionDescription,
          joggingRecommendation,
          joggingQuest
        });
      });
    } catch (e) {
      return next(e);
    }
  });
});

module.exports = router;