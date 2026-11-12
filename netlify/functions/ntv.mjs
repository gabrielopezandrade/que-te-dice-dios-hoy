
export default async (request) => {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") || "";

  if (!/^[A-Za-z0-9]+\.[0-9]{1,3}\.[0-9]{1,3}(?:-[0-9]{1,3})?$/.test(ref)) {
    return new Response("Referencia no válida", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const key = process.env.TYNDALE_API_KEY;

  if (!key) {
    return new Response("Falta configurar TYNDALE_API_KEY en Netlify", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const apiUrl = new URL("https://api.nlt.to/api/passages");
  apiUrl.searchParams.set("ref", ref);
  apiUrl.searchParams.set("version", "NTV");
  apiUrl.searchParams.set("key", key);

  try {
    const upstream = await fetch(apiUrl.toString(), {
      headers: { "Accept": "text/html" }
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return new Response("No se pudo conectar con el servicio de la NTV", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
