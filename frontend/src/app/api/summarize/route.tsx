import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { NextRequest } from "next/server";

import { getAuthToken } from "@/data/services/get-token";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { fetchTranscript } from "@/lib/youtube-transcript";

/**
 * Recibe un array de data: any[]
 * Concatena todas las cadenas de transcripciones
 * y las retorna en un objeto:
 * {
 *  data: data, // es el array como vino
 *  text: text.trim() // aquí estaría todas las transcripciones juntas en un solo texto
 * }
 * @param data
 * @returns
 */
function transformData(data: any[]) {
  let text = "";

  // * Itera la data y va concatenando los textos de la data en uno solo
  data.forEach((item) => {
    text += item.text + " ";
  });

  return {
    data: data,
    text: text.trim(),
  };
}

const TEMPLATE = `
INSTRUCTIONS: 
  For the this {text} complete the following steps.
  Generate the title for based on the content provided
  Summarize the following content and include 5 key topics, writing in first person using normal tone of voice.
  
  Write a youtube video description
    - Include heading and sections.  
    - Incorporate keywords and key takeaways

  Generate bulleted list of key points and benefits

  Return possible and best recommended key words
`;

/**
 *
 * @param content
 * @param template
 */
async function generateSummary(content: string, template: string) {
  const prompt = PromptTemplate.fromTemplate(template);

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
    temperature: process.env.OPENAI_TEMPERATURE
      ? parseFloat(process.env.OPENAI_TEMPERATURE)
      : 0.7,
    maxTokens: process.env.OPENAI_MAX_TOKENS
      ? parseInt(process.env.OPENAI_MAX_TOKENS)
      : 4000,
  });

  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);

  try {
    const summary = await chain.invoke({ text: content });

    return summary;
  } catch (error) {
    if (error instanceof Error)
      return new Response(JSON.stringify({ error: error.message }));
    return new Response(
      JSON.stringify({ error: "Failed to generate summary." })
    );
  }
}

/**
 * Este componente recibe una petición (Request) POST.
 *
 * Se encarga de manejar las respuestas de una petición específica,
 * en este caso de tipo POST, bien sean exitosas o erróneas.
 *
 * Este route handler maneja peticiones de forma customizada, y todas las
 * peticiones a /api/summarize que sean de tipo POST pasarán por aquí
 * de maner automática.
 * @param req
 * @returns
 */
export async function POST(req: NextRequest) {
  // * Obtiene la información del usuario y el token
  const user = await getUserMeLoader();
  const token = await getAuthToken();

  // * Si el usuario no está logueado
  if (!user.ok || !token) {
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 }
    );
  }

  //   * Revisa los créditos del usuario
  if (user.data.credits < 1) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "Insufficient credits",
      }),
      { status: 402 }
    );
  }

  // * Convierte el req en json
  const body = await req.json();
  const { videoId } = body;

  // * esto es un tipado genérico que obtendrá la respuesta de tipo fetchTranscript
  let transcript: Awaited<ReturnType<typeof fetchTranscript>>;

  try {
    transcript = await fetchTranscript(videoId);

    // * Transforma la data, recibiendo la data como está y una propiedad text con toda la transcripción junta
    const transformedData = transformData(transcript);

    let summary: Awaited<ReturnType<typeof generateSummary>>;

    // * Obtiene la respuesta de OpenAI
    summary = await generateSummary(transformedData.text, TEMPLATE);

    // * Retorna una nueva respuesta con la data, sin error y status 200
    return new Response(JSON.stringify({ data: summary, error: null }));
  } catch (error) {
    console.error("Error processing request:", error);

    // * SI hay error retorna una nueva respuesta con el error
    if (error instanceof Error)
      return new Response(JSON.stringify({ error: error.message }));
    return new Response(JSON.stringify({ error: "Unknown error" }));
  }
}
