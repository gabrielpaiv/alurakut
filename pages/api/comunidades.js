import { SiteClient } from 'datocms-client';
export default async function requestReciver(request, response) {
    if (request.method === 'POST') {
        const TOKEN = 'a8144291b5128b22e5c6989acb9d04';
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