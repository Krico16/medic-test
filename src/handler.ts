import { AppoinmentController } from "./appoinment/infra/controllers/AppoinmentController";
import { RouteHandler, Routes } from "./common/utils/handlerRequest";
import { APIGatewayProxyEventV2, SQSEvent } from "aws-lambda";
import { HandleHttpRequest, HandleSqsEvent, middleware } from "./common/utils/middleware";
import { AppoinmentCountryController as ClController } from "./appointmentCL/infra/controller/AppointmentCountryController";
import { AppoinmentCountryController as PeController } from "./appointmentPE/infra/controller/AppointmentCountryController";
import { MessageUtil } from "./common/utils/response";

const appointController = new AppoinmentController();
const CLAppointController = new ClController();
const PEAppointController = new PeController();

const routes: Routes = {
  '/V1/appointment': {
    POST: middleware((request) => appointController.registerAppoinment(request))
  },
  '/V1/appointment/{appoinmentId}': {
    GET: middleware((request) => appointController.SearchAppoinment(request)),
  },
}

export const appointmentHandler: RouteHandler = async (event: APIGatewayProxyEventV2 | SQSEvent) => {
  console.info(`RECEIVED EVENT:: ${JSON.stringify(event)}`);
  try {
    if ('Records' in event && event.Records[0].eventSource === 'aws:sqs') {
      return HandleSqsEvent(event as SQSEvent, async (request) => {
        return appointController.updateAppointment(request);
      });
    }

    return HandleHttpRequest(event as APIGatewayProxyEventV2, routes);
  } catch (error) {
    console.error(error);
    return MessageUtil.error(500, 'An Error has ocurred', error.message);
  }

};

export const handlerAppointmentPE = async (event: SQSEvent) => {
  console.log(`RECEIVED EVENT:: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    const message: any = JSON.parse(record.body);
    await PEAppointController.createAppointment(message);
  }
}

export const handlerAppointmentCL = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message: any = JSON.parse(record.body);
    await CLAppointController.createAppointment(message);
  }

}

