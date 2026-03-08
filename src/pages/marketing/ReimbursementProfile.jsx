import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  IconButton
} from '@mui/material';

// Icons
import FlightIcon from '@mui/icons-material/Flight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileUploadOffIcon from '@mui/icons-material/FileUploadOff';

// Theme Colors
const themeColors = {
  bgApp: '#15122E', // Main background
  bgCard: '#1E1B3E', // Card background
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8CA7',
  accentBlue: '#3B82F6',
  accentGreen: '#22C55E',
  accentRed: '#EF4444',
  accentYellow: '#F59E0B',
  borderLight: 'rgba(255,255,255,0.05)',
  rowHover: 'rgba(255,255,255,0.02)',
};

// Mock Data for Expenses
const expensesData = [
  { id: 1, date: 'Oct 26, 2023', time: '08:15 AM', category: 'Flight to SFO', amount: '$185.50', icon: <FlightIcon fontSize="small" />, billUploaded: true },
  { id: 2, date: 'Oct 26, 2023', time: '01:30 PM', category: 'Lunch with Client', amount: '$65.00', icon: <RestaurantIcon fontSize="small" />, billUploaded: true },
  { id: 3, date: 'Oct 27, 2023', time: '09:00 AM', category: 'Taxi to Client Office', amount: '$28.25', icon: <LocalTaxiIcon fontSize="small" />, billUploaded: true },
  { id: 4, date: 'Oct 27, 2023', time: '06:45 PM', category: 'Dinner', amount: '$42.00', icon: <RestaurantIcon fontSize="small" />, billUploaded: false },
  { id: 5, date: 'Oct 28, 2023', time: '11:00 AM', category: 'Airport Transfer', amount: '$60.00', icon: <LocalTaxiIcon fontSize="small" />, billUploaded: true },
];

export default function ReimbursementProfile() {
  return (
    <Box sx={{ backgroundColor: themeColors.bgApp, minHeight: '100vh', p: 4, fontFamily: 'Inter, sans-serif' }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Header & Table */}
          <Grid item xs={12} md={8}>
            
            {/* Header Card */}
            <Card sx={{ bgcolor: themeColors.bgCard, borderRadius: 4, boxShadow: 'none', mb: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ 
                  bgcolor: themeColors.accentBlue, 
                  color: 'white', 
                  borderRadius: 2, 
                  width: 50, 
                  height: 50, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  mr: 2 
                }}>
                  <FlightIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: themeColors.textPrimary, fontWeight: 600 }}>
                    Q4 Client Visit
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: themeColors.textSecondary, mt: 0.5 }}>
                    <DateRangeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">Oct 26 - Oct 28, 2023</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Expenses Table Card */}
            <Card sx={{ bgcolor: themeColors.bgCard, borderRadius: 4, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: themeColors.textPrimary, fontWeight: 600, mb: 3 }}>
                  Trip Expenses
                </Typography>

                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        {['DATE', 'TIME', 'DESCRIPTION/CATEGORY', 'AMOUNT', 'BILL'].map((head) => (
                          <TableCell key={head} sx={{ 
                            color: themeColors.textSecondary, 
                            fontSize: 11, 
                            fontWeight: 600, 
                            borderBottom: `1px solid ${themeColors.borderLight}`, 
                            pb: 2 
                          }}>
                            {head}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expensesData.map((row) => (
                        <TableRow key={row.id} sx={{ '&:hover': { bgcolor: themeColors.rowHover }, transition: 'background 0.2s' }}>
                          <TableCell sx={{ color: themeColors.textPrimary, borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5, fontWeight: 500 }}>
                            {row.date}
                          </TableCell>
                          <TableCell sx={{ color: themeColors.textSecondary, borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                            {row.time}
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: themeColors.textPrimary }}>
                              <Box sx={{ color: themeColors.textSecondary, mr: 1.5, display: 'flex' }}>
                                {row.icon}
                              </Box>
                              {row.category}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: themeColors.textPrimary, borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5, fontWeight: 600 }}>
                            {row.amount}
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                            {row.billUploaded ? (
                              <Chip 
                                icon={<AttachFileIcon sx={{ fontSize: 16 }} />} 
                                label="Uploaded" 
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(34, 197, 94, 0.15)', 
                                  color: themeColors.accentGreen, 
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: themeColors.accentGreen }
                                }} 
                              />
                            ) : (
                              <Chip 
                                icon={<FileUploadOffIcon sx={{ fontSize: 16 }} />} 
                                label="Missing" 
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(239, 68, 68, 0.15)', 
                                  color: themeColors.accentRed, 
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: themeColors.accentRed }
                                }} 
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Total Row */}
                      <TableRow>
                        <TableCell colSpan={3} sx={{ borderBottom: 'none', pt: 3, pb: 1, textAlign: 'right' }}>
                          <Typography sx={{ color: themeColors.textSecondary, fontWeight: 500 }}>
                            Total Expenses Made:
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', pt: 3, pb: 1 }}>
                          <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700, fontSize: 18 }}>
                            $380.75
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', pt: 3, pb: 1 }}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN: Status & Timeline */}
          <Grid item xs={12} md={4}>
            
            {/* Status Card */}
            <Card sx={{ bgcolor: themeColors.bgCard, borderRadius: 4, boxShadow: 'none', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: themeColors.textPrimary, fontWeight: 600, mb: 3 }}>
                  Reimbursement Status
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: themeColors.textSecondary, fontSize: 14 }}>Total Amount</Typography>
                  <Typography sx={{ color: themeColors.textPrimary, fontWeight: 600, fontSize: 14 }}>$380.75</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: themeColors.textSecondary, fontSize: 14 }}>Advance Received</Typography>
                  <Typography sx={{ color: themeColors.textPrimary, fontWeight: 600, fontSize: 14 }}>$0.00</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, pb: 3, borderBottom: `1px solid ${themeColors.borderLight}` }}>
                  <Typography sx={{ color: themeColors.textSecondary, fontSize: 14 }}>Current Status</Typography>
                  <Chip label="In Review" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: themeColors.accentYellow, fontWeight: 600, height: 24, fontSize: 11 }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: themeColors.textSecondary, fontSize: 14 }}>Approved Amount</Typography>
                  <Typography sx={{ color: themeColors.accentGreen, fontWeight: 600, fontSize: 14 }}>$340.75</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography sx={{ color: themeColors.textSecondary, fontSize: 14 }}>Rejected Amount</Typography>
                  <Typography sx={{ color: themeColors.accentRed, fontWeight: 600, fontSize: 14 }}>$40.00</Typography>
                </Box>

                {/* Remarks Box */}
                <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', border: `1px solid rgba(239, 68, 68, 0.2)`, borderRadius: 2, p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: themeColors.accentRed, mb: 1 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>Remarks</Typography>
                  </Box>
                  <Typography sx={{ color: '#FCA5A5', fontSize: 13 }}>
                    Dinner expense over policy limit.
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Link href="#" underline="hover" sx={{ color: themeColors.accentBlue, fontSize: 14, fontWeight: 500 }}>
                    Dispute Amount &rarr;
                  </Link>
                </Box>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card sx={{ bgcolor: themeColors.bgCard, borderRadius: 4, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: themeColors.textPrimary, fontWeight: 600, mb: 3 }}>
                  Timeline
                </Typography>

                <Box sx={{ position: 'relative', ml: 1 }}>
                  {/* Vertical Line */}
                  <Box sx={{ position: 'absolute', top: 15, bottom: 15, left: 11, width: 2, bgcolor: themeColors.borderLight, zIndex: 0 }} />

                  {/* Step 1 */}
                  <Box sx={{ display: 'flex', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ bgcolor: themeColors.bgCard, borderRadius: '50%', color: themeColors.accentBlue, mr: 2 }}>
                      <CheckCircleOutlineIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ color: themeColors.textPrimary, fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>Applied On</Typography>
                      <Typography sx={{ color: themeColors.textSecondary, fontSize: 12, mt: 0.5 }}>October 29, 2023</Typography>
                    </Box>
                  </Box>

                  {/* Step 2 */}
                  <Box sx={{ display: 'flex', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ bgcolor: themeColors.bgCard, borderRadius: '50%', color: themeColors.accentYellow, mr: 2 }}>
                      <RadioButtonUncheckedIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ color: themeColors.textPrimary, fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>In Approval</Typography>
                      <Typography sx={{ color: themeColors.accentYellow, fontSize: 12, mt: 0.5, fontWeight: 500 }}>Manager Review</Typography>
                    </Box>
                  </Box>

                  {/* Step 3 */}
                  <Box sx={{ display: 'flex', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ bgcolor: themeColors.bgCard, borderRadius: '50%', color: themeColors.textSecondary, mr: 2 }}>
                      <RadioButtonUncheckedIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ color: themeColors.textSecondary, fontWeight: 500, fontSize: 14, lineHeight: 1.2 }}>Approved Date</Typography>
                      <Typography sx={{ color: themeColors.textSecondary, fontSize: 12, mt: 0.5 }}>-</Typography>
                    </Box>
                  </Box>

                  {/* Step 4 */}
                  <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ bgcolor: themeColors.bgCard, borderRadius: '50%', color: themeColors.textSecondary, mr: 2 }}>
                      <RadioButtonUncheckedIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ color: themeColors.textSecondary, fontWeight: 500, fontSize: 14, lineHeight: 1.2 }}>Credited</Typography>
                      <Typography sx={{ color: themeColors.textSecondary, fontSize: 12, mt: 0.5 }}>-</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Grid>
        </Grid>

      </Box>
    </Box>
  );
}