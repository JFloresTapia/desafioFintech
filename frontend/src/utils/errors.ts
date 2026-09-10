import { ApiClientError } from '../services/apiClient';

export function describeError(error: unknown): string {
  if (error instanceof ApiClientError) {
    switch (error.statusCode) {
      case 400:
        return 'La solicitud no es válida. Revisa el RUT ingresado.';
      case 401:
        return 'No estás autenticado o tu sesión expiró.';
      case 403:
        return 'No tienes permisos para consultar este RUT.';
      case 404:
        return 'El recurso solicitado no existe.';
      case 429:
        return 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.';
      default:
        return error.message.length > 0 ? error.message : `Error inesperado (${error.statusCode}).`;
    }
  }
  return 'No fue posible conectar con la API. Verifica tu conexión.';
}