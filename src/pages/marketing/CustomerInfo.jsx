import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Chip,
  Avatar,
  Tabs,
  Tab,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';

// Phosphor Icons
import {
  CheckCircle,
  Wrench,
  Lightbulb,
  Receipt,
  Fire,
  TrendUp,
  AddressBook,
  Briefcase,
  CalendarCheck,
  ChatCircleDots,
  Note,
  ListChecks,
  ClockCounterClockwise,
  Paperclip,
  PaperPlaneRight,
  FilePdf,
  Image as ImageIcon,
  HardHat,
  User
} from "@phosphor-icons/react";

// --- THEME & STYLES ---
const themeColors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#7b2cbf',
  accentGlow: '#9d4edd',
  success: '#00b894',
  blue: '#0984e3',
  warning: '#fdcb6e',
  danger: '#ff6b6b'
};

const glassCardStyle = {
  background: themeColors.glassBg,
  backdropFilter: 'blur(16px)',
  border: themeColors.glassBorder,
  borderRadius: '16px',
  boxShadow: themeColors.glassShadow,
  p: 3,
  mb: 3,
  color: themeColors.textPrimary
};

// --- HELPER COMPONENTS ---

const PipelineStep = ({ label, status, icon: Icon }) => {
  let bg = 'rgba(255,255,255,0.05)';
  let color = themeColors.textSecondary;
  let shadow = 'none';
  let fontWeight = 400;

  if (status === 'completed') {
    bg = themeColors.success;
    color = '#fff';
  } else if (status === 'active') {
    bg = themeColors.accent;
    color = '#fff';
    shadow = `0 0 15px ${themeColors.accent}`;
    fontWeight = 700;
  }

  return (
    <Box sx={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1.5,
      position: 'relative', bgcolor: bg, color: color, fontWeight: fontWeight, boxShadow: shadow,
      clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)', ml: '-15px',
      '&:first-of-type': { ml: 0, clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)', borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' },
      '&:last-child': { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)', borderTopRightRadius: '50px', borderBottomRightRadius: '50px' }
    }}>
      {Icon && <Icon size={18} weight="fill" />}
      <Typography variant="body2" sx={{fontSize: '0.85rem'}}>{label}</Typography>
    </Box>
  );
};

const MetricBox = ({ label, value, isProbability }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography variant="caption" sx={{ color: themeColors.textSecondary, mb: 0.5 }}>{label}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 600, color: isProbability ? themeColors.success : themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {value} {isProbability && <TrendUp size={16} weight="bold" />}
    </Typography>
  </Box>
);

const FieldRow = ({ label, value, icon, isLink, isUser, isWarning }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, fontSize: '0.95rem' }}>
    <Typography sx={{ color: themeColors.textSecondary }}>{label}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isLink ? themeColors.blue : isWarning ? themeColors.warning : themeColors.textPrimary, fontWeight: 500, cursor: isLink ? 'pointer' : 'default' }}>
      {icon}
      {isUser && <Avatar sx={{ width: 20, height: 20 }} src="https://ui-avatars.com/api/?name=Rahul+S&background=random" />}
      {value}
    </Box>
  </Box>
);

const TimelineItemView = ({ status, title, date, assignedTo }) => {
  let color = themeColors.textSecondary;
  if (status === 'done') color = themeColors.success;
  if (status === 'scheduled') color = themeColors.blue;
  if (status === 'pending') color = themeColors.warning;
  if (status === 'process') color = '#a29bfe';

  return (
    <Box sx={{ position: 'relative', mb: 3, pl: 2 }}>
      <Box sx={{ position: 'absolute', left: -24, top: 0, width: 24, height: 24, borderRadius: '50%', bgcolor: themeColors.bgGradient, border: `2px solid ${themeColors.textSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
      </Box>
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: themeColors.glassBorder, borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{date}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#ccc' }}>
          {status === 'pending' ? 'Waiting on: ' : status === 'process' ? 'Prepared by: ' : 'Assigned to: '} 
          <span style={{ color: themeColors.blue, fontWeight: 500 }}>{assignedTo}</span>
        </Typography>
      </Box>
    </Box>
  );
};

const NoteCard = ({ author, role, time, text, files, authorIcon }) => (
  <Box sx={{ ...glassCardStyle, p: 2.5, bgcolor: 'rgba(255,255,255,0.03)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {authorIcon}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: themeColors.accent }}>{author}</Typography>
        <Chip label={role} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: themeColors.textSecondary, height: 20, fontSize: '0.65rem' }} />
      </Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{time}</Typography>
    </Box>
    <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.5, mb: 2 }}>{text}</Typography>
    {files && (
      <Box>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'flex', alignItems: 'center', mb: 1, textTransform: 'uppercase' }}>
          <Paperclip size={14} style={{ marginRight: 4 }} /> 
          {files.length} Attachment{files.length > 1 ? 's' : ''}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {files.map((file, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, px: 1.5, py: 1, cursor: 'pointer', '&:hover': { borderColor: themeColors.accent } }}>
              {file.type === 'pdf' ? <FilePdf size={20} color={themeColors.danger} weight="fill" /> : <ImageIcon size={20} color={themeColors.blue} weight="fill" />}
              <Box>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{file.name}</Typography>
                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{file.size}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    )}
  </Box>
);

// --- MAIN PAGE COMPONENT ---
const CustomerInfo = () => {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  return (
    <Box sx={{ minHeight: '100vh', background: themeColors.bgGradient, color: themeColors.textPrimary, fontFamily: "'Inter', sans-serif", p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 5 }}>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>Action</Button>
            <Button variant="contained" sx={{ bgcolor: themeColors.accent, '&:hover': { bgcolor: themeColors.accentGlow }, boxShadow: `0 0 10px rgba(123, 44, 191, 0.5)` }}>Create Quotation</Button>
          </Box>
        </Box>

        {/* Pipeline Status */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '50px', p: 0.5, mb: 4, overflow: 'visible', backdropFilter: 'blur(5px)' }}>
          <PipelineStep label="Lead Created" status="completed" icon={CheckCircle} />
          <PipelineStep label="Lead Closed" status="completed" icon={CheckCircle} />
          <PipelineStep label="Technical Visit" status="active" icon={Wrench} />
          <PipelineStep label="Solutions" status="pending" icon={Lightbulb} />
          <PipelineStep label="Quotations" status="pending" icon={Receipt} />
        </Box>

        {/* Header Card */}
        <Box sx={glassCardStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexDirection: {xs: 'column', sm: 'row'} }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>Mahindra & Mahindra</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Product Lead" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: themeColors.glassBorder }} />
                <Chip label="High Priority" icon={<Fire size={14} color={themeColors.danger} weight="fill" />} size="small" sx={{ bgcolor: 'rgba(255, 69, 58, 0.2)', color: themeColors.danger, border: '1px solid rgba(255, 69, 58, 0.3)' }} />
              </Box>
            </Box>
          </Box>
          <Grid container spacing={4} sx={{ borderTop: themeColors.glassBorder, pt: 2.5 }}>
            <Grid item xs={6} sm={4}><MetricBox label="Expected Revenue" value="₹ 50,00,000" /></Grid>
            <Grid item xs={6} sm={4}><MetricBox label="Probability" value="85%" isProbability /></Grid>
            <Grid item xs={12} sm={4}><MetricBox label="Closing Date" value="Nov 30, 2025" /></Grid>
          </Grid>
        </Box>

        {/* Details Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={glassCardStyle}>
              <Typography variant="h6" sx={{ borderBottom: themeColors.glassBorder, pb: 2, mb: 2, color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddressBook size={20} /> Contact Information
              </Typography>
              <FieldRow label="Customer" value="Satyam Enterprise" isLink />
              <FieldRow label="Contact Person" value="Satyam Veer Singh" />
              <FieldRow label="Email" value="satyamk1217@gmail.com" />
              <FieldRow label="Phone" value="+91 90284 82719" />
              <FieldRow label="Address" value="Pune, Maharashtra, India" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={glassCardStyle}>
              <Typography variant="h6" sx={{ borderBottom: themeColors.glassBorder, pb: 2, mb: 2, color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Briefcase size={20} /> Internal Tracking
              </Typography>
              <FieldRow label="Salesperson" value="Rahul Sharma" isUser />
              <FieldRow label="Zone" value="North Maharashtra" />
              <FieldRow label="Source" value="Telecaller" />
              <FieldRow label="Next Activity" value="Site Visit - Tomorrow" isWarning icon={<CalendarCheck size={16} />} />
            </Box>
          </Grid>
        </Grid>

        {/* Collaboration Tabs */}
        <Box sx={{ ...glassCardStyle, p: 0, overflow: 'hidden' }}>
          <Tabs value={tabValue} onChange={handleTabChange} textColor="inherit" variant="scrollable" sx={{ borderBottom: themeColors.glassBorder, bgcolor: 'rgba(0,0,0,0.2)', '& .MuiTabs-indicator': { backgroundColor: themeColors.accent } }}>
            <Tab icon={<ChatCircleDots size={20} />} iconPosition="start" label="Discuss" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
            <Tab icon={<Note size={20} />} iconPosition="start" label="Notes" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
            <Tab icon={<ListChecks size={20} />} iconPosition="start" label="Activity" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
            <Tab icon={<ClockCounterClockwise size={20} />} iconPosition="start" label="Log" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <List sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                  <ListItem alignItems="flex-start" sx={{ px: 0, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 2 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: themeColors.blue }}>M</Avatar></ListItemAvatar>
                    <ListItemText primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="subtitle2">Amit Verma (Manager)</Typography><Typography variant="caption" sx={{ color: themeColors.textSecondary }}>2 hours ago</Typography></Box>} secondary={<Typography variant="body2" sx={{ color: '#d1d1d1' }}>@Rahul, please confirm if the technical specs for the 500kVA transformer are attached.</Typography>} />
                  </ListItem>
                  <ListItem alignItems="flex-start" sx={{ px: 0, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <ListItemAvatar><Avatar src="https://ui-avatars.com/api/?name=Rahul+S&background=random" /></ListItemAvatar>
                    <ListItemText primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="subtitle2">Rahul Sharma</Typography><Typography variant="caption" sx={{ color: themeColors.textSecondary }}>15 mins ago</Typography></Box>} secondary={<Typography variant="body2" sx={{ color: '#d1d1d1' }}>Yes sir, I have uploaded it in the Documents tab. Proceeding with the quotation now.</Typography>} />
                  </ListItem>
                </List>
                <Box sx={{ display: 'flex', gap: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 3 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>Me</Avatar>
                  <TextField fullWidth placeholder="Send a message..." variant="standard" InputProps={{ disableUnderline: true, sx: { color: 'white' } }} />
                  <IconButton sx={{ color: themeColors.textSecondary }}><Paperclip size={20} /></IconButton>
                  <Button variant="contained" size="small" endIcon={<PaperPlaneRight size={16} weight="fill" />} sx={{ bgcolor: themeColors.accent }}>Send</Button>
                </Box>
              </Box>
            )}
            {tabValue === 1 && (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', gap: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 3 }}>
                  <TextField fullWidth multiline rows={2} placeholder="Write a note..." variant="standard" InputProps={{ disableUnderline: true, sx: { color: 'white' } }} />
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}><IconButton sx={{ color: themeColors.textSecondary }}><Paperclip size={20} /></IconButton><Button variant="contained" size="small" sx={{ bgcolor: themeColors.accent }}>Submit</Button></Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NoteCard author="Vikas Sutar" role="Technical Team" time="Jan 07, 2026 • 3:00 PM" authorIcon={<HardHat size={18} color={themeColors.accent} weight="fill" />} text="Technical visit done successfully." files={[{ name: "Technical_Report_v1.pdf", size: "2.4 MB", type: "pdf" }]} />
                  <NoteCard author="Sagar Wani" role="Field Marketing" time="Jan 07, 2026 • 10:30 AM" authorIcon={<User size={18} color={themeColors.accent} weight="fill" />} text="Submitted technical data." files={[{ name: "Site_Survey.pdf", size: "1.1 MB", type: "pdf" }]} />
                </Box>
              </Box>
            )}
            {tabValue === 2 && (
              <Box sx={{ position: 'relative', pl: 1, pt: 1 }}>
                <Box sx={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                <TimelineItemView status="scheduled" title="Technical Visit Scheduled" date="Jan 10, 2026" assignedTo="Vikas Sutar" />
                <TimelineItemView status="process" title="Solutions (Sent for Solution)" date="Jan 08, 2026" assignedTo="Technical Team" />
                <TimelineItemView status="done" title="Field Visit Done" date="Jan 07, 2026" assignedTo="Sagar Wani" />
              </Box>
            )}
            {tabValue === 3 && (
              <Box sx={{ color: themeColors.textSecondary, lineHeight: 2 }}>
                <Typography variant="body2">• <b>Rahul Sharma</b> created the lead. (Jan 05, 2026)</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerInfo;