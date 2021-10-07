## cloud_computing_tp3_aws
Proyecto creado en Node utilizando AWS DynamoDB, AWS Lambda y AWS API Gateway

**Legajo:** 42966

**Necesario tener instalado:**

 - Docker
 - Node.js
 - AWS SAM CLI

**Ejecutar los siguientes comandos:**

    docker network create awslocal
    docker run -p 8000:8000 --network awslocal --name dynamodb amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
    --Ingresar a la carpeta del proyecto --
    npm install
    node CreateTable.js
    sam local start-api --docker-network awslocal
