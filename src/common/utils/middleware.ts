import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { Routes } from './handlerRequest';
import { Result } from './response';

/***********************
 *      Interfaces      *
 ***********************/
export interface Request<T = unknown> {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

interface Handler<T = unknown> {
  (request: Request<T>): Promise<APIGatewayProxyResultV2>;
}

/***********************
 *     Middleware      *
 ***********************/
const parseRequestBody = <T>(event: APIGatewayProxyEventV2): T | undefined => {
  if (!event.body) return undefined;

  try {
    return JSON.parse(event.body) as T;
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
};

const parseQueryParams = (event: APIGatewayProxyEventV2): Record<string, string> => {
  return event.queryStringParameters || {};
};

export const middleware = <T>(handler: Handler<T>):
  (event: APIGatewayProxyEventV2, params: Record<string, string>) => Promise<APIGatewayProxyResultV2> => {
  return async (event: APIGatewayProxyEventV2, params: Record<string, string>) => {
    try {
      const request: Request<T> = {
        body: parseRequestBody<T>(event),
        params,
        query: parseQueryParams(event)
      };
      console.info(`Sending body to handler: ${JSON.stringify(request)}`);
      return await handler(request);
    } catch (error) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid request' })
      };
    }
  };
};

export const extractPathParams = (routePath: string, rawPath: string): Record<string, string> => {
  const pathSegments = routePath.split('/');
  const rawSegments = rawPath.split('/');

  return pathSegments.reduce((acc, segment, index) => {
    if (segment.startsWith('{') && segment.endsWith('}')) {
      const paramName = segment.slice(1, -1);
      acc[paramName] = rawSegments[index];
    }
    return acc;
  }, {} as Record<string, string>);
};

export const HandleHttpRequest = async (event: APIGatewayProxyEventV2, routes: Routes): Promise<APIGatewayProxyResultV2> => {
  const routeKey = Object.keys(routes).find(path => {
    const regexPattern = path.replace(/\{(\w+)\}/g, '([^/]+)');
    return new RegExp(`^${regexPattern}$`).test(event.rawPath);
  });

  if (!routeKey) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Route not found' }) };
  }

  const method = event.requestContext.http.method.toUpperCase();
  const routeMethods = routes[routeKey];

  if (!routeMethods[method]) {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Extraer parámetros de la ruta
  const params = extractPathParams(routeKey, event.rawPath);

  return routeMethods[method](event, params);
}

export const HandleSqsEvent = async (event: SQSEvent, handler: Handler): Promise<any> => {
  for (const record of event.Records) {
    const { detail } = JSON.parse(record.body);
    if (!detail.appointmentId || !detail.countryISO) {
      throw new Error('Invalid message');
    }
    await handler({ body: detail });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Messages processed' })
  }
}

export const HandleResponse = (response: Result): APIGatewayProxyResultV2 => {
  const {body, statusCode} = response.bodyToString();
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}