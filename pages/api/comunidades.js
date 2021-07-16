import { SiteClient } from 'datocms-client';
export default async function requestReciver(request, response) {
    if (request.method === 'POST') {
        const { TOKEN } = process.env;
        const client = new SiteClient(TOKEN);
        const registroCriado = await client.item.create({
            itemType: "966400",
            ...request.body,
        })
        response.json({
            dados: 'algum registro',
            registroCriado: registroCriado
        })
        return;
    }
    response.status(404).json({
        message: "nobady here"
    })
}