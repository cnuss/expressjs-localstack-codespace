import express from "express";
import AWS from "aws-sdk";

const BUCKET_NAME = `test-${process.env["CODESPACE_NAME"]}`;
const TAG_NAME = `X-Last-Updated`;

const s3 = new AWS.S3({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: 'localstack', 'secretAccessKey': 'localstack' },
});

const app = express();

app.get("/", async (req, res) => {
  const tagging = await s3.getBucketTagging({ Bucket: BUCKET_NAME }).promise();
  console.log("!!!! tagging", tagging);
  const tagSet = (tagging.TagSet || []).find((ts) => ts.Key === TAG_NAME);
  if (!tagSet) {
    res.send("Tag is not set\n");
    return;
  }
  res.send(`Tag was last updated at: ${tagSet.Value}`);
});

const updateTag = async () => {
  console.log("Updating tag on bucket");
  const now = new Date().toISOString();
  const response = await s3
    .putBucketTagging({
      Bucket: BUCKET_NAME,
      Tagging: {
        TagSet: [{ Key: TAG_NAME, Value: now }],
      },
    })
    .promise();
  console.log("!!! response", response)
  return now;
};

app.listen(3000, "0.0.0.0", async () => {
  console.log("Server started at 3000");
  await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
  setInterval(() => {
    updateTag().then((now) => {
      console.log(`Tag updated to ${now}`);
    });
  }, 5000);
});
