import express from "express";
import bodyParser from "body-parser";
import {Request, Response} from 'express';
import { filterImageFromURL, deleteLocalFiles, requireAuth } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  app.get("/filteredimage", requireAuth, async (req:Request, res:Response) => {
    try {
      const { image_url } = req.query;
      //  1. Validation of the image_url query
      if (!image_url || image_url.length === 0) {
        res.status(400).send("Malformed Query");
      }

      //  2. Call filterImageFromURL function to filter the image
      const filteredpath = await filterImageFromURL(image_url);

      //  3. Send the resulting file in the response
      res.sendFile(filteredpath, async err => {
        if (err) return res.status(500).send({ message: err.message });

        //  4.  Delete file in tmp folder
        await deleteLocalFiles([filteredpath]);
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
