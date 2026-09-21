import { ZodError } from 'zod';

/**
 * Middleware de validation via Zod.
 *
 * @param {import('zod').ZodSchema} schema  - Schema Zod a appliquer.
 * @param {'body'|'query'|'params'} source  - Source des donnees a valider (defaut: 'body').
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      return res.status(400).json({
        success: false,
        error: {
          message: 'Erreur de validation',
          details: errors,
        },
      });
    }

    // Remplacer les donnees par les valeurs transformees / par defaut
    req[source] = result.data;

    next();
  };
};

/**
 * Formate les erreurs Zod en un tableau lisible.
 *
 * @param {ZodError} zodError
 * @returns {Array<{ field: string, message: string }>}
 */
function formatZodErrors(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export default validate;
