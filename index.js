const AWS = require('aws-sdk');
const {v4: uuidv4} = require('uuid');

exports.handler = async (event) => {
    var dynamodb = new AWS.DynamoDB({
        apiVersion: '2012-08-10',
        endpoint: 'http://dynamodb:8000',
        region: 'us-west-2',
        credentials: {
            accessKeyId: '2345',
            secretAccessKey: '2345'
        }
    });
    var docClient = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        service: dynamodb
    });

    // Creacion de un envio
    if(event.path === '/envios' && event.httpMethod === 'POST'){
        
        let body = JSON.parse(event.body)

        // Destino y/o email faltantes en el body
        if (!body.destino || !body.email) {
            return {
                statusCode: 400,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    message: "Destino y email son necesarios.",
                    example: {
                        destino: "Mendoza",
                        email: "user@mail.com"
                    }
                })}
        }

        let params = {
            TableName: 'Envio',
            Item: {
                id: uuidv4(),
                fechaAlta: new Date().toISOString(),
                destino: body.destino,
                email: body.email,
                pendiente: new Date().toISOString(),
            }
        };

        try {
            await docClient.put(params).promise()
            return {
                statusCode: 201,
                headers: { "content-type": "application/json" },
                body: JSON.stringify(params.Item)
            };
        } catch {
            return {
                statusCode: 400,
                headers: { "content-type": "text/plain" },
                body: 'No se pudo crear el envío.'
            };
        }

    }

    // Listar envios pendientes
    else if (event.path === '/envios/pendientes' && event.httpMethod === 'GET') {
        let params = {
            TableName: 'Envio',
            IndexName: 'EnviosPendientesIndex'
        };

        try {
            const envios = await docClient.scan(params).promise()
            return {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify(envios)
            }
        } catch (err) {
            console.log(err)
            return {
                statusCode: 400,
                headers: { "content-type": "text/plain" },
                body: 'No se pudo obtener los envíos pendientes.'
            };
        }

    }

    // Actulizar envio eliminando atributo pendiente
    else if (event.path === `/envios/${event.pathParameters.idEnvio}/entregado` && event.httpMethod === 'PUT') {
        const idEnvio = (event.pathParameters || {}).idEnvio || false;
        let params = {
            TableName : "Envio",
            Key : {
                id: idEnvio           
            },
            UpdateExpression : "remove pendiente",
            ConditionExpression: "attribute_exists(pendiente)",
            ReturnValues : "UPDATED_NEW"        
        };

        try {
            await docClient.update(params).promise()
            return {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: `El envio id: ${idEnvio} fue entregado.`
            };
        } catch {
            return {
                statusCode: 400,
                headers: { "content-type": "text/plain" },
                body: `Error al actualizar ${idEnvio}.`
            };
        }
    }
    else {
        return {
            statusCode: 400,
            headers: { "content-type": "text/plain" },
            body: `Método ${httpMethod} no soportado.`
        };
    }
}
