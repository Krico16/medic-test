import { AppoinmentController } from "./appoinment/infra/controllers/AppoinmentController";
import { Routes } from "./common/utils/handlerRequest";
import { APIGatewayProxyEventV2, SQSEvent } from "aws-lambda";
import { HandleHttpRequest, HandleResponse, HandleSqsEvent, middleware } from "./common/utils/middleware";
import { AppoinmentCountryController as ClController } from "./appointmentCL/infra/controller/AppointmentCountryController";
import { AppoinmentCountryController as PeController } from "./appointmentPE/infra/controller/AppointmentCountryController";
import { MessageUtil } from "./common/utils/response";
import { log, info, debug } from "console";

const appointController = new AppoinmentController();
const CLAppointController = new ClController();
const PEAppointController = new PeController();

export const routes: Routes = {
  '/V1/appointment': {
    POST: middleware((request) => appointController.registerAppoinment(request))
  },
  '/V1/appointment/{appoinmentId}': {
    GET: middleware((request) => appointController.SearchAppoinment(request)),
  },
}

export const appointmentHandler = async (event: APIGatewayProxyEventV2 | SQSEvent) => {
  debug(`RECEIVED EVENT:: ${JSON.stringify(event)}`);
  info(`RECEIVED EVENT:: ${JSON.stringify(event)}`);
  try {
    if ('Records' in event && event.Records[0].eventSource === 'aws:sqs') {
      return HandleSqsEvent(event as SQSEvent, async (request) => {
        return appointController.updateAppointment(request);
      });
    }

    return HandleHttpRequest(event as APIGatewayProxyEventV2, routes);
  } catch (error) {
    if (error instanceof MessageUtil) {
      return error
    }
    return MessageUtil.error(500, 'An Error has ocurred', error.message);
  }

};

export const handlerAppointmentPE = async (event: SQSEvent) => {
  log(`RECEIVED EVENT:: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    const message: any = JSON.parse(record.body);
    await PEAppointController.createAppointment(message);
  }
  return MessageUtil.success({ message: 'Appointment created successfully' });
}

export const handlerAppointmentCL = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message: any = JSON.parse(record.body);
    await CLAppointController.createAppointment(message);
  }
  return MessageUtil.success({ message: 'Appointment created successfully' });
}

