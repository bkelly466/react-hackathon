import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { jishoProxy } from './functions/jisho-proxy/resource';

// CDK imports for the "escape hatch" — when Amplify's high-level helpers
// don't cover what we need, we drop down to the underlying AWS CDK constructs.
// FunctionUrl lets us give the Lambda its own public HTTPS endpoint.
// FunctionUrlAuthType.NONE makes it publicly callable (no IAM signing needed).
import {
  FunctionUrl,
  FunctionUrlAuthType,
} from 'aws-cdk-lib/aws-lambda';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  jishoProxy,
});

// --- CDK escape hatch: add a Lambda Function URL ---
//
// A Lambda Function URL is a stable HTTPS endpoint that AWS creates for a
// Lambda function. We use it so the browser can reach the proxy without
// needing API Gateway (which adds cost and setup complexity).
//
// `backend.jishoProxy.resources.lambda` gives us the underlying CDK IFunction
// object that Amplify created when it processed our defineFunction() above.
// From there we can use any CDK Lambda API.

const jishoProxyFn = backend.jishoProxy.resources.lambda;

// Create the Function URL.
// authType: NONE  → no AWS IAM signing required; anyone can call this URL.
//   This is fine because it's a read-only proxy for public Jisho data.
//
// Note: we deliberately do NOT set a `cors` block here. The Lambda handler
// (functions/jisho-proxy/handler.ts) sets the CORS response headers itself and
// answers the OPTIONS preflight. Configuring CORS in both places can produce
// duplicated headers (e.g. "Access-Control-Allow-Origin: *, *"), which browsers
// reject — so we keep all CORS logic in the handler, in one place.
const fnUrl = new FunctionUrl(
  // Every CDK construct needs a "scope" (where it lives in the stack) and
  // an "id" (a unique name within that scope).
  backend.jishoProxy.resources.lambda,   // scope: nest it under the Lambda
  'JishoProxyFunctionUrl',               // id: arbitrary, must be unique in scope
  {
    function: jishoProxyFn,
    authType: FunctionUrlAuthType.NONE,
  }
);

// Emit the Function URL into the Amplify backend outputs.
//
// `addOutput` writes values into the amplify_outputs.json file that Amplify
// generates during the backend build.
//
// Amplify does NOT automatically turn custom outputs into env vars. Instead,
// the amplify.yml preBuild step reads jishoProxyUrl back out of
// amplify_outputs.json and exports it as VITE_JISHO_PROXY_URL, which Vite then
// embeds into the production bundle. See amplify.yml.
//
// Note: addOutput is typed for Amplify-specific config keys, so we use the
// `custom` key which accepts arbitrary string values.
backend.addOutput({
  custom: {
    jishoProxyUrl: fnUrl.url,
  },
});
