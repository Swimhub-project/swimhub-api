import mongoose, { model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { LogRequestData, LogData } from '../../types/log';
const { Schema } = mongoose;

const logRequestDataSchema = new Schema<LogRequestData>(
  {
    url: { type: String, required: true },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PATCH', 'DELETE'],
      required: true,
    },
    ip: { type: String, required: true },
    body: { type: Object },
    headers: { type: Object },
  },
  { _id: false }
);

const logSchema = new Schema(
  {
    level: {
      type: String,
      required: true,
      enum: ['info', 'warn', 'error', 'critical'],
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    responseCode: {
      type: Number,
      required: true,
    },
    request: {
      type: logRequestDataSchema,
      required: true,
    },
  },
  { versionKey: false }
);

logSchema.plugin(paginate);

interface LogDocument extends mongoose.Document, LogData {}

export const Log = model<LogDocument, mongoose.PaginateModel<LogDocument>>(
  'Log',
  logSchema,
  'logs'
);
