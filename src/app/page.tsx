// src/app/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { v4 as uuidv4 } from "uuid";
import {
  cleanSignatures,
  matchSignatures,
  SignatureImage,
  MatchApiResponse,
} from "@/services/api";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Styled component for a visually hidden file input
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

// Styled component for the main container of each signature pane
const ImageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
  width: "100%", // Take full width of the Grid item
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: theme.spacing(2),
  minHeight: "450px", // Ensure consistent minimum height
  boxSizing: "border-box", // Include padding in width calculation
}));

// Container for centering content within each Grid item
const ContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  width: "100%",
  maxWidth: "400px", // Cap the content width for better layout
});

// Styled component for the image previews
const SignatureImagePreview = styled("img")({
  maxWidth: "100%",
  maxHeight: "150px",
  objectFit: "contain",
  border: "1px solid #ddd",
  borderRadius: "4px",
});

// Helper function to read a file and convert it to a base64 string
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// New interface to hold both the image data and its "dirty" state
interface SignatureState {
  image: SignatureImage;
  dirty: boolean;
}

export default function HomePage() {
  const [sig1, setSig1] = useState<SignatureState | null>(null);
  const [sig2, setSig2] = useState<SignatureState | null>(null);

  const [cleanedSig1, setCleanedSig1] = useState<SignatureImage | null>(null);
  const [cleanedSig2, setCleanedSig2] = useState<SignatureImage | null>(null);

  const [matchResult, setMatchResult] = useState<MatchApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState({ clean: false, match: false });
  const [error, setError] = useState<string | null>(null);

  // Memoized value to determine if the clean button should be enabled
  const isCleanEnabled = useMemo(() => {
    // Enable if either signature exists and is marked as dirty
    return (sig1?.dirty || sig2?.dirty) ?? false;
  }, [sig1, sig2]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    signatureNumber: 1 | 2
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await toBase64(file);
      const newSignature: SignatureState = {
        image: { id: uuidv4(), data: base64 },
        dirty: true, // Mark as dirty on new upload
      };

      if (signatureNumber === 1) {
        setSig1(newSignature);
        setCleanedSig1(null); // Reset cleaned image on new upload
      } else {
        setSig2(newSignature);
        setCleanedSig2(null); // Reset cleaned image on new upload
      }
      setMatchResult(null); // Reset any previous match result
      setError(null);
    } catch (err) {
      setError("Failed to read file.");
      console.error(err);
    }
  };

  const handleClean = async () => {
    // Collect only the "dirty" images that need cleaning
    const imagesToClean: SignatureImage[] = [];
    if (sig1?.dirty) {
      imagesToClean.push(sig1.image);
    }
    if (sig2?.dirty) {
      imagesToClean.push(sig2.image);
    }

    if (imagesToClean.length === 0) {
      // This case should ideally not be reachable due to the button's disabled state, but it's good practice.
      setError("No new signatures to clean.");
      return;
    }

    setIsLoading((prev) => ({ ...prev, clean: true }));
    setError(null);

    try {
      const response = await cleanSignatures(imagesToClean);
      response.cleaned_images.forEach((cleanedImg) => {
        // Update cleaned image previews and reset dirty flags
        if (cleanedImg.id === sig1?.image.id) {
          setCleanedSig1(cleanedImg);
          setSig1((s) => (s ? { ...s, dirty: false } : null));
        }
        if (cleanedImg.id === sig2?.image.id) {
          setCleanedSig2(cleanedImg);
          setSig2((s) => (s ? { ...s, dirty: false } : null));
        }
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{
          justifyContent: "center",
          alignItems: "stretch",
          "& > *": {
            flex: { xs: "1 1 auto", md: "1 1 50%" },
            width: { xs: "100%", md: "50%" },
            minWidth: 0, // Prevent flex items from overflowing
          },
        }}
      >
        {/* Signature 1 Pane */}
        <Box>
          <ImageContainer>
            <ContentContainer>
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
                  src={sig1.image.data}
                  alt="Original Signature 1"
                />
              )}

              {sig1 && cleanedSig1 && <ArrowDownwardIcon color="action" />}

              {cleanedSig1 && (
                <SignatureImagePreview
                  src={cleanedSig1.data}
                  alt="Cleaned Signature 1"
                />
              )}
            </ContentContainer>
          </ImageContainer>
        </Box>

        {/* Signature 2 Pane */}
        <Box>
          <ImageContainer>
            <ContentContainer>
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
                  src={sig2.image.data}
                  alt="Original Signature 2"
                />
              )}

              {sig2 && cleanedSig2 && <ArrowDownwardIcon color="action" />}

              {cleanedSig2 && (
                <SignatureImagePreview
                  src={cleanedSig2.data}
                  alt="Cleaned Signature 2"
                />
              )}
            </ContentContainer>
          </ImageContainer>
        </Box>
      </Stack>

      <Box textAlign="center" my={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClean}
          disabled={!isCleanEnabled || isLoading.clean}
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
        <Paper sx={{ p: 3, mt: 3, mx: "auto", maxWidth: "md" }}>
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
            <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
              Similarity Score:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={matchResult.similarity_score * 100}
              sx={{ width: "100%", height: 10, borderRadius: 5 }}
              color={matchResult.match === "match" ? "success" : "error"}
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
