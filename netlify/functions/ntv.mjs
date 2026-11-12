
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
    return new Response("Falta configurar TYNDALE_API_KEY", {
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
    const contentType = upstream.headers.get("content-type") || "(vacío)";

    if (!body.trim()) {
      return new Response(
        `Tyndale devolvió una respuesta vacía. HTTP: ${upstream.status}. Content-Type: ${contentType}.`,
        {
          status: 502,
          headers: { "content-type": "text/plain; charset=utf-8" }
        }
      );
    }

    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return new Response("Error al conectar con Tyndale", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
