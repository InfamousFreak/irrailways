/**
 * @fileoverview Express.js server to handle KML file uploads and provide secure access via signed URLs.
 */
require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { DOMParser } = require("xmldom");
const tj = require("@tmcw/togeojson");
const turf = require("@turf/turf");

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "*",
  })
);

// --- In-memory store for cable plans ---
// In a production application, this would be a database (e.g., Firestore, PostgreSQL).
let cablePlans = [];

// --- Middleware ---

/**
 * @description Fetches the list of files from the GCS bucket and populates the in-memory 'cablePlans' array.
 * This makes the server aware of existing files upon startup.
 */
const populatePlansFromGCS = async () => {
  try {
    const [files] = await bucket.getFiles();
    cablePlans = []; // Clear the array to avoid duplicates on any re-fetch

    files.forEach((file) => {
      // We only care about KML files
      if (file.name.toLowerCase().endsWith(".kml")) {
        cablePlans.push({
          id: file.metadata.generation, // A unique ID for the file version
          planName: file.name, // Default plan name to the filename
          fileName: file.name,
        });
      }
    });

    console.log(
      `Successfully populated ${cablePlans.length} plans from GCS bucket: ${bucketName}`
    );
  } catch (error) {
    console.error("Error populating plans from GCS:", error);
    cablePlans = []; // Ensure we start with an empty list on error
  }
};

app.use(express.json()); // Middleware to parse JSON bodies

/**
 * Configure multer for file upload handling.
 * We use memoryStorage to temporarily hold the file in a buffer before streaming it to GCS.
 * This avoids writing the file to the local disk of the server.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
});

// --- GCS Configuration ---

/**
 * Instantiate the Google Cloud Storage client.
 * The client will automatically use the credentials configured in your environment
 * (e.g., from the GOOGLE_APPLICATION_CREDENTIALS environment variable).
 * The Project ID is loaded from the .env file.
 */

const keyFilePath = path.join(__dirname, "google-credentials.json");
const storage = new Storage({
  keyFilename: keyFilePath,
  projectId: process.env.GCP_PROJECT_ID,
});

/**
 * Specify the name of your private GCS bucket from the .env file.
 */
const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

// --- API Endpoints ---

/**
 * @route GET /api/plans
 * @description Retrieves the list of all uploaded cable plans.
 */
app.get("/api/plans", (req, res) => {
  res.status(200).json(cablePlans);
});

/**
 * @route POST /api/upload
 * @description Handles the upload of a single KML file and its associated plan name.
 * It uses multer to process the 'plan-file' field from a multipart/form-data request.
 * The file is then streamed directly to a private Google Cloud Storage bucket.
 */
app.post("/api/upload", upload.single("plan-file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }
  if (!req.body.planName) {
    return res.status(400).send({ message: "Plan name is required." });
  }

  const { planName } = req.body;
  const fileName = req.file.originalname;

  // Create a new blob in the GCS bucket with the original filename.
  const blob = bucket.file(fileName);

  /**
   * Create a writable stream to the GCS blob.
   * This allows us to pipe the file buffer from memory directly to GCS
   * without saving it to the server's local file system.
   */
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on("error", (err) => {
    console.error("GCS stream error:", err);
    res.status(500).send({ message: err.message });
  });

  blobStream.on("finish", () => {
    // Add the plan to our in-memory list upon successful upload.
    const newPlan = { id: Date.now().toString(), planName, fileName };
    // Avoid adding duplicates
    if (!cablePlans.some((p) => p.fileName === fileName)) {
      cablePlans.push(newPlan);
    }
    console.log(`Successfully uploaded ${fileName} to ${bucketName}.`);
    res
      .status(200)
      .send({ message: `File ${fileName} uploaded successfully.` });
  });

  // End the stream by writing the file's buffer to it.
  blobStream.end(req.file.buffer);
});

/**
 * @route GET /api/kml/:fileName
 * @description Generates and returns a secure, time-limited signed URL for a given file.
 * This allows the frontend to temporarily access a private object in GCS without
 * making the object itself public.
 */
app.get("/api/kml/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    if (!fileName) {
      return res.status(400).send("File name is required.");
    }

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    // Get a v4 signed URL for the file
    const [url] = await bucket.file(fileName).getSignedUrl(options);
    console.log(`Generated signed URL for ${fileName}: ${url}`);
    res.status(200).json({ url });
  } catch (error) {
    console.error(
      `Failed to generate signed URL for ${req.params.fileName}:`,
      error
    );
    res
      .status(500)
      .send({ message: "Could not generate file URL.", error: error.message });
  }
});

/**
 * @route GET /api/geojson/:fileName
 * @description Fetches a KML file, converts it to GeoJSON, simplifies it, and returns it.
 * This is the high-performance endpoint for large datasets.
 */
app.get("/api/geojson/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName || !fileName.toLowerCase().endsWith(".kml")) {
      return res
        .status(400)
        .send({ message: "Valid KML file name is required." });
    }

    const file = bucket.file(fileName);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).send({ message: "File not found." });
    }

    // 1. Download the KML file from GCS into a buffer.
    const [kmlBuffer] = await file.download();
    const kmlString = kmlBuffer.toString("utf8");

    // 2. Parse the KML string into a DOM object and convert to GeoJSON.
    const kmlDom = new DOMParser().parseFromString(kmlString);
    const geoJson = tj.kml(kmlDom);

    // 3. Simplify the GeoJSON to reduce its size and complexity.
    const options = { tolerance: 0.001, highQuality: true };
    const simplifiedGeoJson = turf.simplify(geoJson, options);

    res.status(200).json(simplifiedGeoJson);
  } catch (error) {
    console.error(
      `Failed to process GeoJSON for ${req.params.fileName}:`,
      error
    );
    res.status(500).send({ message: "Could not process KML file." });
  }
});

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  populatePlansFromGCS();
});
