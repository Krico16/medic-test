import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';

// Tipo para los manejadores de rutas
export type RouteHandler = (event: APIGatewayProxyEventV2 | SQSEvent, params: Record<string, string>) => Promise<any>;

// Tipo para los métodos HTTP (GET, POST, PUT, DELETE, etc.)
type HttpMethods = {
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  DELETE?: RouteHandler;
};

// Tipo para la estructura de las rutas
export type Routes = {
  [path: string]: HttpMethods;
};
