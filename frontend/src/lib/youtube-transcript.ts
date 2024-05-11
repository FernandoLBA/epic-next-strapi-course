import { parse } from "node-html-parser";

import { extractYouTubeID } from "./utils";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)";

class YoutubeTranscriptError extends Error {
  constructor(message: string) {
    super(`[YoutubeTranscript] ${message}`);
  }
}

type YtFetchConfig = {
  lang?: string; // Object with lang param (eg: en, es, hk, uk) format.
};

/**
 * Esta función recibe el videoId:string que en realidad es el url del video de youtube
 * y la configuración para youtube config:YtFetchConfig.
 * Su fin es transcribir un video de youtube a texto y devolver esa transcripción
 * en un array
 * @param videoId
 * @param config
 * @returns
 */
async function fetchTranscript(videoId: string, config: YtFetchConfig = {}) {
  console.log("fetchTranscript", videoId);
  // * Trae el identificador del video de youtube
  const identifier = extractYouTubeID(videoId);
  // * Establece el lenguaje a usar
  const lang = config?.lang ?? "en";
  try {
    // * Hace un fetch a youtube uniendo el url con el identificador recibido y almacenando un endpoint
    const transcriptUrl = await fetch(
      `https://www.youtube.com/watch?v=${identifier}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    )
      .then((res) => res.text())
      // * Lo convierte a html
      .then((html) => parse(html))
      // * Le manda el html y el lenguaje y retorna un endpoint
      .then((html) => parseTranscriptEndpoint(html, lang));

    //   * Si no hay respuesta
    if (!transcriptUrl)
      throw new Error("Failed to locate a transcript for this video!");

    // Result is hopefully some XML.
    const transcriptXML = await fetch(transcriptUrl)
      .then((res) => res.text())
      .then((xml) => parse(xml));

    // * Extrae el tag text del xml
    const chunks = transcriptXML.getElementsByTagName("text");

    let transcriptions = [];
    // * Itera los chunks
    for (const chunk of chunks) {
      // * Extrae atributos
      const [offset, duration] = chunk.rawAttrs.split(" ");
      // * Pushea un objeto
      transcriptions.push({
        text: chunk.text,
        // * Convierte a milisegundos
        offset: convertToMs(offset),
        duration: convertToMs(duration),
      });
    }

    // * Retorna el array de objetos transcriptions
    return transcriptions;
  } catch (e: any) {
    throw new YoutubeTranscriptError(e);
  }
}

/**
 * Recibe un texto:string
 * por ejemplo: 'dur="3.4"'
 * lo corta y lo convierte a float:
 * ejemplo: 3.4
 * lo múltiplica por 1000:
 * 3400
 * y lo retorna redondeado como milisegundos
 * @param text
 * @returns
 */
function convertToMs(text: string) {
  const float = parseFloat(text.split("=")[1].replace(/"/g, "")) * 1000;
  return Math.round(float);
}

/**
 * Recibe un document: any html, un langCode: string opcional,
 *
 * Retorna un endpoint de transcripción con varios datos en el
 * @param document
 * @param langCode
 * @returns
 */
function parseTranscriptEndpoint(document: any, langCode?: string) {
  try {
    // Get all script tags on document page
    const scripts = document.getElementsByTagName("script");

    // find the player data script.
    const playerScript = scripts.find((script: any) =>
      script.textContent.includes("var ytInitialPlayerResponse = {")
    );

    const dataString =
      playerScript.textContent
        ?.split("var ytInitialPlayerResponse = ")?.[1] //get the start of the object {....
        ?.split("};")?.[0] + // chunk off any code after object closure.
      "}"; // add back that curly brace we just cut.

    const data = JSON.parse(dataString.trim()); // Attempt a JSON parse
    const availableCaptions =
      data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

    // If languageCode was specified then search for it's code, otherwise get the first.
    let captionTrack = availableCaptions?.[0];
    if (langCode)
      captionTrack =
        availableCaptions.find((track: any) =>
          track.languageCode.includes(langCode)
        ) ?? availableCaptions?.[0];

    return captionTrack?.baseUrl;
  } catch (e: any) {
    console.error(`parseTranscriptEndpoint Error: ${e.message}`);
    return null;
  }
}

export { YoutubeTranscriptError, fetchTranscript };
