// backend/src/models/Climate.js
import mongoose from 'mongoose';

const ClimateSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    temperature: Number,
    precipitation: Number,
    humidity: Number,
    solar: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    queryVector: [Number],
});
ClimateSchema.index({ location: '2dsphere' });

export const Climate = mongoose.models.Climate
    || mongoose.model('Climate', ClimateSchema);
