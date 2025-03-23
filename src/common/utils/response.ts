import { Response } from '../model/response';

enum StatusCode {
    success = 200,
    badRequest = 400,
}

class Result {
    private statusCode: number;
    private code: number;
    private message: string;
    private data?: any;

    constructor(statusCode: number, code: number, message: string, data?: any) {
        this.statusCode = statusCode;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * Serverless: According to the API Gateway specs, the body content must be stringified
     */
    bodyToString() {
        return {
            statusCode: this.statusCode,
            body: JSON.stringify({
                code: this.code,
                message: this.message,
                data: this.data,
            }),
        };
    }
}

export class MessageUtil {
    static success(data: object): Response {
        const result = new Result(StatusCode.success, 0, 'success', data);

        return result.bodyToString();
    }

    static error(code: number = 1000, message: string, data: object) {
        const result = new Result(StatusCode.badRequest, code, message, data);

        console.log(result.bodyToString());
        return result.bodyToString();
    }
}