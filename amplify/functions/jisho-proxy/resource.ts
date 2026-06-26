/**
 * Amplify Gen 2 function definition for the Jisho proxy.
 *
 * `defineFunction` is the Amplify Gen 2 way to declare a Lambda function.
 * Under the hood it creates an AWS Lambda backed by the handler.ts file in
 * this directory.
 *
 * The `entry` option tells Amplify where the handler code lives.
 * The `timeoutSeconds` is bumped from the 3-second default to 10 because
 * we make an outbound HTTP request to Jisho inside the Lambda — that can
 * take a few seconds, especially cold-start.
 */
import { defineFunction } from '@aws-amplify/backend';

export const jishoProxy = defineFunction({
  name: 'jisho-proxy',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
