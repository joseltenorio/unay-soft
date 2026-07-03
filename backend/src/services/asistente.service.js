// backend/src/services/asistente.service.js

const { getCartaPublica } = require("./public.service")

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const GEMINI_TIMEOUT_MS = 15000

const MAX_HISTORIAL_MENSAJES = 6

function buildProductosPlanos(categorias) {
  const productos = []

  for (const categoria of categorias) {
    for (const producto of categoria.productos || []) {
      productos.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_base: producto.precio_base,
        imagen_referencial: producto.imagen_referencial,
        categoria: categoria.nombre,
        etiquetas: (producto.etiquetas || []).map((e) => e.nombre),
      })
    }
  }

  return productos
}

function buildContextoTexto(productos) {
  if (productos.length === 0) {
    return "No hay productos disponibles actualmente."
  }

  return productos
    .map((p) => {
      const etiquetas = p.etiquetas.length ? ` | Etiquetas: ${p.etiquetas.join(", ")}` : ""
      const descripcion = p.descripcion ? ` | ${p.descripcion}` : ""

      return `- [${p.id_producto}] ${p.nombre} (${p.categoria}) - S/. ${p.precio_base}${descripcion}${etiquetas}`
    })
    .join("\n")
}

function buildSystemPrompt(nombreEstablecimiento, contextoProductos) {
  return `Eres el asistente virtual de "${nombreEstablecimiento}", un restaurante. Tu única fuente de verdad es la siguiente lista de productos disponibles hoy:

${contextoProductos}

Reglas estrictas:
- Solo puedes recomendar o mencionar productos que estén en la lista de arriba.
- Nunca inventes precios, ingredientes o productos que no existan en la lista.
- Si el cliente pregunta algo no relacionado con la carta (ingredientes, precios, recomendaciones, disponibilidad, restricciones alimentarias), responde amablemente que solo puedes ayudar con temas de la carta.
- Sé breve y natural, como un mesero atento, no un robot.
- No pidas ni almacenes datos personales del cliente.

Debes responder SIEMPRE en formato JSON válido, sin texto fuera del JSON, con esta forma exacta:
{
  "intencion": "ingredientes" | "precio" | "disponibilidad" | "recomendacion" | "restriccion" | "otro" | "no_entendido",
  "respuesta": "texto de respuesta en español, natural y breve",
  "productos_relevantes": ["id_producto1", "id_producto2"]
}

"productos_relevantes" debe contener SOLO ids que existan en la lista de arriba, y solo cuando la respuesta involucre productos específicos (recomendaciones, búsquedas por ingrediente, etc). Si no aplica, devuelve un array vacío.`
}

function buildContentsGemini(historial, mensaje) {
  const historialRecortado = (historial || []).slice(-MAX_HISTORIAL_MENSAJES)

  const contentsHistorial = historialRecortado
    .filter((h) => h && h.rol && h.contenido)
    .map((h) => ({
      role: h.rol === "asistente" ? "model" : "user",
      parts: [{ text: String(h.contenido) }],
    }))

  return [
    ...contentsHistorial,
    { role: "user", parts: [{ text: mensaje }] },
  ]
}

async function callGemini(systemPrompt, contents) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("El asistente no está configurado correctamente.")
    error.statusCode = 503
    throw error
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  let response

  try {
    response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
      signal: controller.signal,
    })
  } catch (fetchError) {
    if (fetchError.name === "AbortError") {
      const error = new Error("El asistente tardó demasiado en responder.")
      error.statusCode = 504
      throw error
    }

    const error = new Error("No se pudo contactar al asistente.")
    error.statusCode = 502
    throw error
  } finally {
    clearTimeout(timeout)
  }
if (!response.ok) {
    const errorBody = await response.text().catch(() => "")

    console.error(
      "[asistente] Gemini respondió con error. status:",
      response.status,
      "body:",
      errorBody
    )

    const error = new Error(
      response.status === 429
        ? "El asistente está recibiendo muchas consultas, intenta en un momento."
        : "El asistente no pudo procesar la consulta."
    )
    error.statusCode = response.status === 429 ? 429 : 502
    throw error
  }

  const data = await response.json()
  const candidato = data?.candidates?.[0]
  const contenido = candidato?.content?.parts?.[0]?.text

  if (!contenido) {
    console.error(
      "[asistente] Respuesta vacía de Gemini. finishReason:",
      candidato?.finishReason,
      "raw:",
      JSON.stringify(data)
    )

    const error = new Error("El asistente no devolvió una respuesta válida.")
    error.statusCode = 502
    throw error
  }

  try {
    return JSON.parse(contenido)
  } catch {
    console.error("[asistente] JSON inválido de Gemini:", contenido)

    const error = new Error("El asistente devolvió un formato inesperado.")
    error.statusCode = 502
    throw error
  }
}

/**
 * Punto de entrada principal: recibe el mensaje del cliente, arma el contexto
 * de productos del establecimiento, consulta a Gemini, y enriquece los
 * productos relevantes con datos reales de BD antes de responder al frontend.
 */
async function consultarAsistente({ publicIdentifier, mensaje, historial }) {
  if (!mensaje || !String(mensaje).trim()) {
    const error = new Error("El mensaje es requerido.")
    error.statusCode = 400
    throw error
  }

  const carta = await getCartaPublica(publicIdentifier)
  const productosPlanos = buildProductosPlanos(carta.categorias)
  const contextoProductos = buildContextoTexto(productosPlanos)

  const systemPrompt = buildSystemPrompt(
    carta.establecimiento.nombre_comercial,
    contextoProductos
  )

  const contents = buildContentsGemini(historial, String(mensaje).trim())

  const resultado = await callGemini(systemPrompt, contents)

  const idsRelevantes = new Set(
    Array.isArray(resultado.productos_relevantes) ? resultado.productos_relevantes : []
  )

  const productosEnriquecidos = productosPlanos.filter((p) =>
    idsRelevantes.has(p.id_producto)
  )

  return {
    intencion: resultado.intencion || "otro",
    respuesta: resultado.respuesta || "No pude procesar tu consulta, ¿puedes reformularla?",
    productos: productosEnriquecidos,
  }
}

module.exports = {
  consultarAsistente,
}