import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

type UploadStatus =
  | "idle"
  | "ready"
  | "getting-presigned-url"
  | "uploading"
  | "success"
  | "error";

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [lastUploadedFileName, setLastUploadedFileName] = React.useState("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      setStatus("ready");
      setErrorMessage("");
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setStatus("idle");
    setErrorMessage("");
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      setStatus("getting-presigned-url");
      setErrorMessage("");

      // Step 1: Get the presigned URL from the import API.
      const response = await axios.get<string>(url, {
        params: { name: file.name },
      });

      const presignedUrl = response.data;
      setStatus("uploading");

      // Step 2: PUT the file directly to S3 using the presigned URL.
      const uploadResult = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "text/csv",
        },
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file to S3");
      }

      setLastUploadedFileName(file.name);
      setFile(undefined);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    }
  };

  const isUploading =
    status === "getting-presigned-url" || status === "uploading";

  const statusMessageByState: Record<UploadStatus, string> = {
    idle: "No file selected. No API calls have been made.",
    ready:
      "File selected. No API call has been made yet. Click Upload file to start processing.",
    "getting-presigned-url":
      "Upload started: calling GET /import to get a presigned URL.",
    uploading: "Presigned URL received. Uploading file to S3 with PUT now.",
    success: `Upload completed${lastUploadedFileName ? ` for ${lastUploadedFileName}` : ""}.`,
    error: "Upload failed. See details below and try again.",
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Stack spacing={1.5}>
        {!file ? (
          <input type="file" accept=".csv,text/csv" onChange={onFileChange} />
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={removeFile}
              disabled={isUploading}
            >
              Remove file
            </Button>
            <Button
              variant="contained"
              onClick={uploadFile}
              disabled={isUploading}
            >
              {isUploading ? "Processing..." : "Upload file"}
            </Button>
          </Stack>
        )}

        <Alert severity={status === "error" ? "error" : "info"}>
          {statusMessageByState[status]}
        </Alert>

        {file && (
          <Typography variant="body2">Selected file: {file.name}</Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Remove file clears the current selection so you can choose a different
          CSV before making any API call.
        </Typography>

        {status === "error" && errorMessage && (
          <Typography variant="body2" color="error">
            Error details: {errorMessage}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
