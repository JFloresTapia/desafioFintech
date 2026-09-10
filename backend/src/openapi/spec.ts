/**
 * Documento OpenAPI 3.0 de la API. Se mantiene a mano (y versionado) porque
 * es la fuente de verdad de contrato/ejemplos para quien consume la API y
 * para la UI de Swagger en GET /api-docs.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Fintech · Score de Riesgo Financiero',
    version: '1.0.0',
    description:
      'API para autenticación (JWT) y consulta del score de riesgo financiero por RUT. ' +
      'Ejemplos: user `12.345.678-5` / `password`, admin `99.999.999-9` / `admin123`.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor de desarrollo' }],
  tags: [
    { name: 'Auth', description: 'Autenticación de usuarios' },
    { name: 'Score', description: 'Consulta de score de riesgo por RUT' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Rut: {
        type: 'string',
        description: 'RUT chileno con dígito verificador válido, formato 12.345.678-5.',
        example: '12.345.678-5',
        pattern: '^\\d{1,2}(\\.\\d{3}){2}-[0-9Kk]$',
      },
      LoginRequest: {
        type: 'object',
        required: ['rut', 'password'],
        properties: {
          rut: { $ref: '#/components/schemas/Rut' },
          password: { type: 'string', description: 'Contraseña en texto plano (nunca se loguea).' },
        },
      },
      PublicUser: {
        type: 'object',
        required: ['id', 'rut', 'role'],
        properties: {
          id: { type: 'string', example: 'user-001' },
          rut: { $ref: '#/components/schemas/Rut' },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
      },
      LoginResponse: {
        type: 'object',
        required: ['token', 'expiresIn', 'user'],
        properties: {
          token: { type: 'string', description: 'JWT firmado (HS256).' },
          expiresIn: { type: 'string', example: '1h' },
          user: { $ref: '#/components/schemas/PublicUser' },
        },
      },
      ScoreResponse: {
        type: 'object',
        required: ['rut', 'score', 'fecha'],
        properties: {
          rut: { $ref: '#/components/schemas/Rut' },
          score: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Score de riesgo. Más alto = mayor riesgo. Determinista por RUT.',
          },
          fecha: { type: 'string', format: 'date-time', description: 'Fecha ISO 8601 de la consulta.' },
        },
      },
      ApiError: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          statusCode: { type: 'integer', description: 'Código HTTP del error.' },
          message: { type: 'string', description: 'Descripción legible del error.' },
        },
      },
    },
  },
  paths: {
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Inicia sesión y devuelve un JWT',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                user: {
                  value: { rut: '12.345.678-5', password: 'password' },
                },
                admin: {
                  value: { rut: '99.999.999-9', password: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login exitoso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '400': {
            description: 'Body o RUT inválido.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '401': {
            description: 'Credenciales incorrectas.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '429': {
            description: 'Demasiados intentos de login.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/score/{rut}': {
      get: {
        tags: ['Score'],
        summary: 'Consulta el score de riesgo de un RUT',
        description:
          'Requerido el header Authorization: Bearer <token>. user solo puede consultar su propio RUT; admin cualquiera.',
        operationId: 'getScore',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'rut',
            in: 'path',
            required: true,
            description: 'RUT a consultar.',
            schema: { $ref: '#/components/schemas/Rut' },
            example: '11.111.111-1',
          },
        ],
        responses: {
          '200': {
            description: 'Score calculado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScoreResponse' },
              },
            },
          },
          '400': {
            description: 'RUT inválido.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '401': {
            description: 'Token no proporcionado, inválido o expirado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '403': {
            description: 'El usuario no tiene permisos para consultar ese RUT.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '404': {
            description: 'Ruta no encontrada.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '429': {
            description: 'Demasiadas consultas de score.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
  },
} as const;