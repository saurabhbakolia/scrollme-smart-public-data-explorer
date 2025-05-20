import { VertexAI } from '@google-cloud/vertexai';

export async function handleQuery(req, res) {
    const { query } = req.body;
    const vertexAI = new VertexAI({ project: process.env.GOOGLE_PROJECT_ID });
    const model = vertexAI.getTextEmbeddingModel('text-embedding-005');
    const embedding = await model.getEmbeddings([query]);

    const results = await mongoose.connection.db.collection('climates')
        .aggregate([
            {
                $vectorSearch: {
                    index: 'climate_index',
                    path: 'embedding',
                    queryVector: embedding[0].values,
                    limit: 10
                }
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    temperature: 1,
                    precipitation: 1,
                    coordinates: '$location.coordinates'
                }
            }
        ]).toArray();

    res.json(results);
}
