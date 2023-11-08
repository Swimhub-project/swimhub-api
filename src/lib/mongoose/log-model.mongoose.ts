import mongoose, { model } from 'mongoose';
import { IMetadata, ILog } from '../../types/log';
const { Schema } = mongoose;

const metadataSchema = new Schema<IMetadata>(
  {
    url: { type: String, required: true },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PATCH', 'DELETE'],
      required: true,
    },
    responseCode: { type: Number, required: true },
    ip: { type: String, required: true },
  },
  { _id: false }
);

const logSchema = new Schema<ILog>(
  {
    level: {
      type: String,
      required: true,
      enum: ['info', 'warn', 'error', 'fatal'],
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    metadata: {
      type: metadataSchema,
      required: true,
    },
  },
  { versionKey: false }
);

export const Log = model('Log', logSchema);
