/**
 * Schema entry point — copy this folder into a Sanity Studio project and
 * register in its sanity.config.ts:
 *
 *   import { schemaTypes } from './schemas'
 *   export default defineConfig({ ..., schema: { types: schemaTypes } })
 *
 * These files are NOT compiled as part of the web app (they import the
 * 'sanity' studio package, which is only installed in the Studio project).
 */
import { about } from './about';
import { project } from './project';

export const schemaTypes = [project, about];
