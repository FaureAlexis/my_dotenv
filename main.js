import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

const findEnvFile = () => {
  const envFile = '.env*';
  
  const files = fs.readdirSync(path.resolve(_dirname, '.'));
  const envFiles = files.filter((file) => file.match(envFile));

  return envFiles;
};

const readEnvFileToObject = (envFile) => {
  const env = {};
  // get file content
  const envFileContent = fs.readFileSync(path.resolve(_dirname, '.', envFile), 'utf8');
  if (!envFileContent) {
    return env;
  }
  // get an array of lines
  const envFileLines = envFileContent.split('\n');
  
  // loop through each line and add it to the env object
  envFileLines.forEach((line) => {
    const [key, value] = line.split('=');
    env[key] = value;
  });
  
  return env;
}

const populateEnv = (env, override = true) => {
  Object.keys(env).forEach((key) => {
    // if override is false and the env variable is already set, skip
    if (override || !process.env[key]) {
      process.env[key] = env[key];
    }
  });
}

const config = (opt) => {
  // find all env files
  const envFiles = findEnvFile();
  if (!envFiles.length) {
    return;
  }

  for (const envFile of envFiles) {
    // if the env file is production, only load it if the NODE_ENV is production
    if (envFile.includes('production')) {
      if (process.env.NODE_ENV !== 'production') {
        continue;
      }
      const env = readEnvFileToObject(envFile);
      populateEnv(env, opt && opt.override);
      continue;
    }
    // parse the env file and add it to the process.env
    const env = readEnvFileToObject(envFile);
    populateEnv(env, opt && opt.override);
  }

  return envFiles;
}

export default config;