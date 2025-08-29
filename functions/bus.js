// /functions/bus.js
import { getBus } from "../bus.js";

export async function onRequest(context) {
  try {
    const data = await getBus();
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
