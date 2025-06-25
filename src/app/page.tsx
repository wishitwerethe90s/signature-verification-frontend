// src/app/page.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  LinearProgress,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { v4 as uuidv4 } from "uuid"; // Use a library to generate unique IDs
import {
  cleanSignatures,
  matchSignatures,
  SignatureImage,
  MatchApiResponse,
} from "@/services/api";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ImageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(2),
}));

const SignatureImagePreview = styled("img")({
  maxWidth: "100%",
  maxHeight: "200px",
  border: "1px solid #ddd",
  borderRadius: "4px",
});

// Helper function to read file as base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function HomePage() {
  const [sig1, setSig1] = useState<SignatureImage | null>(null);
  const [sig2, setSig2] = useState<SignatureImage | null>(null);

  const [cleanedSig1, setCleanedSig1] = useState<SignatureImage | null>(null);
  const [cleanedSig2, setCleanedSig2] = useState<SignatureImage | null>(null);

  const [matchResult, setMatchResult] = useState<MatchApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState({ clean: false, match: false });
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    signatureNumber: 1 | 2
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await toBase64(file);
      const newSignature: SignatureImage = { id: uuidv4(), data: base64 };
      if (signatureNumber === 1) {
        setSig1(newSignature);
        setCleanedSig1(null); // Reset cleaned image on new upload
      } else {
        setSig2(newSignature);
        setCleanedSig2(null); // Reset cleaned image on new upload
      }
      setMatchResult(null); // Reset match result
      setError(null);
    } catch (err) {
      setError("Failed to read file.");
    }
  };

  const handleClean = async () => {
    if (!sig1 && !sig2) {
      setError("Please upload at least one signature to clean.");
      return;
    }

    const imagesToClean: SignatureImage[] = [sig1, sig2].filter(
      Boolean
    ) as SignatureImage[];

    setIsLoading((prev) => ({ ...prev, clean: true }));
    setError(null);

    try {
      const response = await cleanSignatures(imagesToClean);
      response.cleaned_images.forEach((cleanedImg) => {
        if (cleanedImg.id === sig1?.id) setCleanedSig1(cleanedImg);
        if (cleanedImg.id === sig2?.id) setCleanedSig2(cleanedImg);
      });
    } catch (err) {
      setError(
        "Failed to clean signatures. Please check the backend connection."
      );
      console.error(err);
    } finally {
      setIsLoading((prev) => ({ ...prev, clean: false }));
    }
  };

  const handleCompare = async () => {
    if (!cleanedSig1 || !cleanedSig2) {
      setError("Please upload and clean both signatures before comparing.");
      return;
    }

    setIsLoading((prev) => ({ ...prev, match: true }));
    setMatchResult(null);
    setError(null);

    try {
      const result = await matchSignatures(cleanedSig1, cleanedSig2);
      setMatchResult(result);
    } catch (err) {
      setError(
        "Failed to compare signatures. Please check the backend connection."
      );
      console.error(err);
    } finally {
      setIsLoading((prev) => ({ ...prev, match: false }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Signature Matching Application
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Signature 1 Pane */}
        <Grid item xs={12} md={6}>
          <ImageContainer>
            <Typography variant="h6">Signature 1</Typography>
            <Button component="label" variant="contained">
              Upload Original
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 1)}
              />
            </Button>
            {sig1 && (
              <SignatureImagePreview
                src={sig1.data}
                alt="Original Signature 1"
              />
            )}
            {cleanedSig1 && (
              <SignatureImagePreview
                src={cleanedSig1.data}
                alt="Cleaned Signature 1"
              />
            )}
          </ImageContainer>
        </Grid>

        {/* Signature 2 Pane */}
        <Grid item xs={12} md={6}>
          <ImageContainer>
            <Typography variant="h6">Signature 2</Typography>
            <Button component="label" variant="contained">
              Upload Original
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 2)}
              />
            </Button>
            {sig2 && (
              <SignatureImagePreview
                src={sig2.data}
                alt="Original Signature 2"
              />
            )}
            {cleanedSig2 && (
              <SignatureImagePreview
                src={cleanedSig2.data}
                alt="Cleaned Signature 2"
              />
            )}
          </ImageContainer>
        </Grid>
      </Grid>

      <Box textAlign="center" my={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClean}
          disabled={(!sig1 && !sig2) || isLoading.clean}
          startIcon={
            isLoading.clean ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {isLoading.clean ? "Cleaning..." : "Clean Signatures"}
        </Button>
      </Box>

      <Box textAlign="center" my={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompare}
          disabled={!cleanedSig1 || !cleanedSig2 || isLoading.match}
          startIcon={
            isLoading.match ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {isLoading.match ? "Comparing..." : "Compare Signatures"}
        </Button>
      </Box>

      {matchResult && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Comparison Result
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color={
              matchResult.match === "match" ? "success.main" : "error.main"
            }
            gutterBottom
          >
            Result: {matchResult.match.toUpperCase()}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Similarity Score:</Typography>
            <LinearProgress
              variant="determinate"
              value={matchResult.similarity_score * 100}
              sx={{ width: "100%", height: 10, borderRadius: 5 }}
            />
            <Typography variant="body1">
              {(matchResult.similarity_score * 100).toFixed(2)}%
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
