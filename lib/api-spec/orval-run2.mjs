import path from 'path';
import { fileURLToPath } from 'url';
import { generate } from 'orval';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const apiClientReactSrc = path.resolve(root, 'lib', 'api-client-react', 'src');
const apiZodSrc = path.resolve(root, 'lib', 'api-zod', 'src');
const openapiPath = path.resolve(__dirname, 'openapi.yaml');

console.log('Running orval with:', openapiPath);

// Try generate with config object - check source: when passed non-string, 
// it calls normalizeOptions(optionsExport) directly
// Looking at source: if not string, it calls normalizeOptions(optionsExport, workspace, options)
// which means optionsExport is a single config, not {projectName: config}

const singleConfig = {
  input: {
    target: openapiPath,
  },
  output: {
    workspace: apiClientReactSrc,
    target: 'generated',
    client: 'react-query',
    mode: 'split',
    baseUrl: '/api',
    clean: true,
    prettier: true,
    override: {
      fetch: {
        includeHttpResponseReturnType: false,
      },
      mutator: {
        path: path.resolve(apiClientReactSrc, 'custom-fetch.ts'),
        name: 'customFetch',
      },
    },
  },
};

await generate(singleConfig, __dirname);
console.log('Client codegen done!');

const zodConfig = {
  input: {
    target: openapiPath,
  },
  output: {
    workspace: apiZodSrc,
    client: 'zod',
    target: 'generated',
    schemas: { path: 'generated/types', type: 'typescript' },
    mode: 'split',
    clean: true,
    prettier: true,
    override: {
      zod: {
        coerce: {
          query: ['boolean', 'number', 'string'],
          param: ['boolean', 'number', 'string'],
        },
      },
      useDates: true,
      useBigInt: true,
    },
  },
};

await generate(zodConfig, __dirname);
console.log('Zod codegen done!');
