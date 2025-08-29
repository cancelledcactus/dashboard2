// /functions/weather.js
import { getWeather } from "../weather.js";

export async function onRequest(context) {
  try {
    const data = await getWeather();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
