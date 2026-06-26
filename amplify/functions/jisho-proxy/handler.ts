/**
 * Jisho API Proxy — Lambda handler
 *
 * Why this exists:
 *   Jisho (jisho.org) doesn't send CORS headers that allow browser requests.
 *   So we can't call it directly from the React app. Instead, the app calls
 *   this Lambda, which runs server-side (no CORS restriction applies), fetches
 *   from Jisho, and returns the result.
 *
 * How it's reached:
 *   This Lambda has a "Function URL" — a public HTTPS endpoint AWS creates for
 *   it. The frontend is given that URL via the VITE_JISHO_PROXY_URL env var at
 *   build time. Locally, the Vite dev proxy still handles /api/jishoapi instead.
 *
 * Event format:
 *   Lambda Function URLs send an event that looks like an API Gateway HTTP API
 *   (payload format v2). The query string comes in as
 *   event.queryStringParameters, e.g. { keyword: "日" }.
 */

// LambdaFunctionURLEvent is the TypeScript type for the event object Lambda
// receives when invoked via a Function URL. It's imported from @types/aws-lambda,
// which is already installed as a transitive dependency of the Amplify backend
// toolchain — no need to install it separately.
//
// APIGatewayProxyResultV2 is the return type: an object with statusCode,
// headers, and a body string that Lambda turns back into an HTTP response.
import type { LambdaFunctionURLEvent, APIGatewayProxyResultV2 } from 'aws-lambda';

const JISHO_API_BASE = 'https://jisho.org/api/v1/search/words';

/**
 * Main Lambda handler.
 * AWS calls this function for every request to the Function URL.
 *
 * @param event - Contains the incoming HTTP request details (method, headers,
 *                query string, body). We only care about queryStringParameters.
 * @returns An object that Lambda turns into an HTTP response (statusCode +
 *          headers + body string).
 */
export const handler = async (
  event: LambdaFunctionURLEvent
): Promise<APIGatewayProxyResultV2> => {

  // CORS headers — the Lambda Function URL is on a different origin
  // (*.lambda-url.*.on.aws) than the Amplify Hosting domain. Without these
  // headers the browser will block the response. We allow any origin here
  // because this is a read-only proxy for public Jisho data.
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle the browser's preflight OPTIONS request (part of the CORS protocol).
  // The browser sends this before a cross-origin GET to check if it's allowed.
  const method = event.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // This is a read-only proxy: only GET is supported. Reject anything else
  // rather than silently forwarding it to Jisho (which we always call as a GET).
  if (method && method !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Pull the keyword out of the query string, e.g. /api/jishoapi?keyword=日
  const keyword = event.queryStringParameters?.keyword;

  // Require a keyword, and cap its length so a giant string can't make us burn
  // Lambda time on a doomed Jisho request. Real lookups are a handful of chars.
  if (!keyword || keyword.length > 200) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'keyword query parameter is required (max 200 characters)' }),
    };
  }

  try {
    const jishoUrl = `${JISHO_API_BASE}?keyword=${encodeURIComponent(keyword)}`;
    const response = await fetch(jishoUrl);

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Jisho API returned an error' }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: corsHeaders,
      // JSON.stringify turns the Jisho response object into a string that Lambda
      // sends back as the HTTP response body. The client does JSON.parse via
      // response.json() in fetchCommonWords.
      body: JSON.stringify(data),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: message }),
    };
  }
};
