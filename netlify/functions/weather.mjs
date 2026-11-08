
export default async (request) => {
  const url = new URL(request.url);
  const city = url.searchParams.get("q")?.trim();

  if (!city) {
    return Response.json(
      { error: { message: "Please enter a city." } },
      { status: 400 }
    );
  }

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: { message: "Weather service is not configured." } },
      { status: 500 }
    );
  }

  try {
    const apiUrl = new URL(
      "https://api.weatherapi.com/v1/current.json"
    );

    apiUrl.search = new URLSearchParams({
      key: apiKey,
      q: city,
      aqi: "yes"
    });

    const response = await fetch(apiUrl);
    const data = await response.json();

    return Response.json(data, {
      status: response.status
    });

  } catch (error) {
    return Response.json(
      { error: { message: "Unable to fetch weather data." } },
      { status: 502 }
    );
  }
};

export const config = {
  path: "/api/weather"
};
