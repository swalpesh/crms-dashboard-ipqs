// src/pages/TwoStepVerification.jsx
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

export default function TwoStepVerification() {
  // keep image's left inset equal to the card padding on md+
  const PAD_MD = 5; // theme.spacing(5) ~= 40px
  const OTP_LENGTH = 4;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef(Array.from({ length: OTP_LENGTH }, () => null));

  // countdown (start at 10:00)
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const mmss = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  useEffect(() => {
    // autofocus first box
    inputsRef.current?.[0]?.focus?.();
  }, []);

  const handleChange = (val, idx) => {
    if (val === "") {
      // cleared
      setOtp((arr) => {
        const next = [...arr];
        next[idx] = "";
        return next;
      });
      return;
    }
    // only digits
    if (!/^\d$/.test(val)) return;

    setOtp((arr) => {
      const next = [...arr];
      next[idx] = val;
      return next;
    });

    // move to next
    if (idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus?.();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && otp[idx] === "" && idx > 0) {
      inputsRef.current[idx - 1]?.focus?.();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputsRef.current[idx - 1]?.focus?.();
    }
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus?.();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const last = Math.min(pasted.length, OTP_LENGTH) - 1;
    inputsRef.current[last]?.focus?.();
    e.preventDefault();
  };

  const codeFilled = otp.every((d) => d !== "");

  const handleVerify = () => {
    const code = otp.join("");
    console.log("Verify OTP:", code);
    // TODO: call your API then route onward
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
        }}
      >
        {/* LEFT: content (40%) */}
        <Box
          sx={{
            flexBasis: { md: "40%" },
            flexGrow: 0,
            flexShrink: 0,
            height: { md: "100%" },
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 10px 24px rgba(0,0,0,.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: PAD_MD },
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                flex: 1,
                minHeight: 0,
                overflow: { xs: "visible", md: "auto" },
              }}
            >
              {/* brand */}
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#ffb703,#4361ee)",
                  }}
                />
                <Typography variant="h6" fontWeight={800}>
                  CRMS
                </Typography>
              </Stack>

              {/* heading & copy */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Login With Your Email Address
                </Typography>
                <Typography color="text.secondary">
                  We sent a verification code to your email. Enter the code from the email in
                  the field below
                </Typography>
              </Box>

              {/* OTP fields */}
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2 }}
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <TextField
                    key={i}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value.slice(-1), i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    inputRef={(el) => (inputsRef.current[i] = el)}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 1,
                      style: {
                        textAlign: "center",
                        fontSize: "28px",
                        fontWeight: 800,
                        lineHeight: 1,
                      },
                    }}
                    sx={{
                      width: { xs: 56, md: 68 },
                      "& .MuiOutlinedInput-root": {
                        height: { xs: 56, md: 68 },
                        borderRadius: 2,
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* timer */}
              <Typography sx={{ mt: 2 }} fontWeight={700}>
                OTP will expire in {mmss}
              </Typography>

              {/* verify */}
              <Button
                variant="contained"
                onClick={handleVerify}
                disabled={!codeFilled || secondsLeft === 0}
                sx={{
                  mt: 2,
                  bgcolor: "#d71914",
                  "&:hover": { bgcolor: "#bf1511" },
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                Verify My Account
              </Button>

              {/* footer */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: "auto" }}>
                Copyright © 2025 – CRMS
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT: image (60%) with matching left inset */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            flexBasis: { md: "60%" },
            flexGrow: 0,
            flexShrink: 0,
            minWidth: 0,
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(0,0,0,.08)",
              bgcolor: "#fff",
            }}
          >
            {/* left inset so visual padding matches the card */}
            <Box sx={{ height: "100%", width: "100%" }}>
              <img
                src="/otp.png" // place your image in /public/otp.jpg
                alt="Two-factor verification"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
