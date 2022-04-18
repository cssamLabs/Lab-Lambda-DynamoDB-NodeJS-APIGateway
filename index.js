const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "DELETE /deletePhoto/{id}":
        await dynamo
          .delete({
            TableName: "MyGallery",
            Key: {
              Id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted Photo ${event.pathParameters.id}`;
        break;

      case "GET /getPhoto/{id}":
        console.log("at getPhoto");
        console.log("id", event.pathParameters.id);
        body = await dynamo
          .get({
            TableName: "MyGallery",
            Key: {
              Id: event.pathParameters.id
            }
          })
          .promise();
        break;

      case "GET /allPhotos":
        console.log("at allPhotos");
        body = await dynamo.scan({ TableName: "MyGallery" }).promise();
        break;

      case "PUT /createPhoto":
        let imageMeta = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "MyGallery",
            Photo: {
                Id: imageMeta.id,
                Folder: imageMeta.dstFolder,
                Src: imageMeta.dstSrcName,
                Thumb: imageMeta.dstThumbName,
                Latlng: imageMeta.imageLatlng,
                Address: imageMeta.imageAddress,
                City: imageMeta.imageCity,
                Country: imageMeta.Country,
                Postcode: imageMeta.imagePostcode,
                PlaceId: imageMeta.imagePlaceId,
                StateProvince: imageMeta.imageStateProvince,
                DateTimeOriginal: imageMeta.imageOriginalDate,
                IsPublic: false,
              }
          })
          .promise();
        body = `Put Photo ${event.pathParameters.id}`;
        break;

      case "PATCH /makePhotoPublic/{id}":
        console.log("at makePhotoPublic");
        const parsedBody = JSON.parse(event.body);
        let IsPublic = parsedBody.IsPublic;
        console.log("IsPublic", IsPublic);
        console.log("id", event.pathParameters.id);
        await dynamo
        .update({
          TableName: "MyGallery",
          Key: {
            Id: event.pathParameters.id
          },
          UpdateExpression: "set IsPublic = :r",
          ExpressionAttributeValues:{
                ":r":IsPublic,
          },
          ReturnValues:"UPDATED_NEW"
        })
        .promise();
      body = `Update Photo ${event.pathParameters.id}`;
          break;  
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
