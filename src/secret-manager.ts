import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export async function loadSecrets() {
  let secrets: Record<string, undefined>;

  const region = 'eu-central-1';

  // Create a Secrets Manager client
  const client = new SecretsManager({
    region,
  });

  // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
  // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  // We rethrow the exception by default.

  const data = await client.getSecretValue({
    SecretId: process.env.SECRET_MANAGER_ARN,
  });

  // Decrypts secret using the associated KMS key.
  // Depending on whether the secret is a string or binary, one of these fields will be populated.
  if (data.SecretString) {
    secrets = JSON.parse(data.SecretString);
  } else {
    const buff = Buffer.from(data.SecretBinary!);
    secrets = JSON.parse(buff.toString('ascii'));
  }

  Object.assign(process.env, secrets);
}
