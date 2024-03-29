import pkg from 'mongoose';
const { model, Schema, Document } = pkg;

const AggregatedStampSchema = new Schema({
	token: String,
	stamp: Date,
	obup: Number,
	obdown: Number,
	volume: Number,
});

const AggregatedStampModel = model("AggregatedStamp", AggregatedStampSchema);

export default AggregatedStampModel;