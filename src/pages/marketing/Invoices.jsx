// src/pages/marketing/Invoices.jsx
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useMemo, useState } from "react";

/* ------------------- helpers ------------------- */
const money = (n, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n || 0);

async function ensurePdfLibs() {
  const needJSPDF = !(window.jspdf && window.jspdf.jsPDF);
  if (needJSPDF) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = res;
      s.onerror = () => rej(new Error("Failed to load jsPDF"));
      document.head.appendChild(s);
    });
  }
}

function createInvoicePdf({ invoiceId, paymentId, quoteNo, amount }) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.setFontSize(18);
  pdf.text("INVOICE", 105, 18, { align: "center" });
  pdf.setFontSize(12);
  pdf.text(`Invoice ID: ${invoiceId}`, 20, 36);
  pdf.text(`Payment ID: ${paymentId}`, 20, 44);
  pdf.text(`Quotation #: ${quoteNo}`, 20, 52);
  pdf.text(`Amount: ${money(amount)}`, 20, 60);
  pdf.text(`Date: ${new Date().toLocaleString()}`, 20, 68);
  pdf.line(20, 75, 190, 75);
  pdf.text("Thank you for your business!", 20, 88);
  pdf.save(`${invoiceId}.pdf`);
}

/* ------------------- seed data ------------------- */
const SEED_INVOICES = [
  {
    invoiceId: "INV-0001",
    paymentId: "PMT-0002",
    quoteNo: "QT-0002",
    amount: 98500,
    createdAt: "2025-09-11T15:15:00Z",
    sentAt: "2025-09-11T16:00:00Z",
    sentTo: "finance@primeplastics.com",
    sentCount: 1,
  },
  {
    invoiceId: "INV-0002",
    paymentId: "PMT-0001",
    quoteNo: "QT-0001",
    amount: 20000,
    createdAt: "2025-09-10T10:45:00Z",
    sentAt: null,
    sentTo: "",
    sentCount: 0,
  },
  {
    invoiceId: "INV-0003",
    paymentId: "PMT-0003",
    quoteNo: "QT-0003",
    amount: 10000,
    createdAt: "2025-08-06T12:15:00Z",
    sentAt: null,
    sentTo: "",
    sentCount: 0,
  },
];

export default function Invoices() {
  const [rows, setRows] = useState(SEED_INVOICES);
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  /* -------------- Send dialog state -------------- */
  const [openSend, setOpenSend] = useState(false);
  const [sendFor, setSendFor] = useState(null); // row object
  const [sendTo, setSendTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  /* -------------- View details dialog -------------- */
  const [openView, setOpenView] = useState(false);
  const [viewFor, setViewFor] = useState(null);

  const paged = useMemo(
    () => rows.slice(page * rpp, page * rpp + rpp),
    [rows, page, rpp]
  );

  const handleOpenSend = (row) => {
    setSendFor(row);
    setSendTo(row.sentTo || "accounts@example.com");
    setSubject(`Invoice ${row.invoiceId} for Quotation ${row.quoteNo}`);
    setBody(
      `Dear Sir/Madam,\n\nPlease find attached the invoice ${row.invoiceId} for quotation ${row.quoteNo} amounting to ${money(
        row.amount
      )}.\n\nRegards,\nIPQS Private Limited`
    );
    setOpenSend(true);
  };

  const handleConfirmSend = () => {
    const nowIso = new Date().toISOString();
    setRows((list) =>
      list.map((r) =>
        r.invoiceId === sendFor.invoiceId
          ? {
              ...r,
              sentAt: nowIso,
              sentTo: sendTo,
              sentCount: (r.sentCount || 0) + 1,
            }
          : r
      )
    );
    setOpenSend(false);
    alert(
      `Invoice ${sendFor.invoiceId} sent to ${sendTo} for quotation ${sendFor.quoteNo}.`
    );
  };

  const handleOpenView = (row) => {
    setViewFor(row);
    setOpenView(true);
  };

  const handleResend = () => {
    if (!viewFor) return;
    // Reuse send dialog values prefilled from last
    handleOpenSend(viewFor);
    setOpenView(false);
  };

  const handleDownload = async (row) => {
    await ensurePdfLibs();
    createInvoicePdf({
      invoiceId: row.invoiceId,
      paymentId: row.paymentId,
      quoteNo: row.quoteNo,
      amount: row.amount,
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 6 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight={800}>
          Invoices
        </Typography>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table
            sx={{
              minWidth: 1100,
              "& thead th": { bgcolor: "#fafafa", fontWeight: 700 },
              "& td, & th": { whiteSpace: "nowrap", verticalAlign: "middle" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 140 }}>Invoice ID</TableCell>
                <TableCell sx={{ minWidth: 140 }}>Payment ID</TableCell>
                <TableCell sx={{ minWidth: 140 }}>Quotation #</TableCell>
                <TableCell sx={{ minWidth: 140 }}>Amount</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Created At</TableCell>
                <TableCell align="right" sx={{ minWidth: 340 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paged.map((row) => (
                <TableRow key={row.invoiceId} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReceiptLongOutlinedIcon fontSize="small" />
                      <span>{row.invoiceId}</span>
                      {row.sentAt ? (
                        <Chip
                          size="small"
                          color="success"
                          label="Sent"
                          sx={{ ml: 1 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="default"
                          variant="outlined"
                          label="Not Sent"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{row.paymentId}</TableCell>
                  <TableCell>{row.quoteNo}</TableCell>
                  <TableCell>{money(row.amount)}</TableCell>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                      alignItems="center"
                      sx={{ "& .MuiButton-root": { whiteSpace: "nowrap" } }}
                    >
                      <Tooltip title="Download invoice PDF">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadOutlinedIcon />}
                          onClick={() => handleDownload(row)}
                        >
                          Download
                        </Button>
                      </Tooltip>

                      {!row.sentAt ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<SendOutlinedIcon />}
                          onClick={() => handleOpenSend(row)}
                        >
                          Send Invoice
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<SendOutlinedIcon />}
                            onClick={() => handleOpenSend(row)}
                          >
                            Send Again
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => handleOpenView(row)}
                          >
                            View Details
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    No invoices yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rpp}
          onRowsPerPageChange={(e) => {
            setRpp(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows per page:"
          sx={{ px: 2 }}
        />
      </Paper>

      {/* ---------------- Send Invoice Dialog ---------------- */}
      <Dialog
        open={openSend}
        onClose={() => setOpenSend(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Invoice to Customer</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {sendFor && (
            <Stack spacing={2}>
              <TextField
                label="To (email)"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                type="email"
              />
              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <TextField
                label="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                minRows={6}
              />
              <Box sx={{ color: "text.secondary", fontSize: 13 }}>
                Attachment: <b>{sendFor.invoiceId}.pdf</b>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenSend(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSend}
            startIcon={<SendOutlinedIcon />}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- View Details Dialog ---------------- */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invoice Delivery Details</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {viewFor ? (
            <Stack spacing={1.2} sx={{ fontSize: 15 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <InfoOutlinedIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <b>Invoice ID:</b> {viewFor.invoiceId}
                </Box>
              </Stack>
              <Box>
                <b>Sent To:</b> {viewFor.sentTo || "—"}
              </Box>
              <Box>
                <b>Sent At:</b>{" "}
                {viewFor.sentAt
                  ? new Date(viewFor.sentAt).toLocaleString()
                  : "—"}
              </Box>
              <Box>
                <b>Times Sent:</b> {viewFor.sentCount || 0}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenView(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ReplayOutlinedIcon />}
            onClick={handleResend}
          >
            Resend
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
