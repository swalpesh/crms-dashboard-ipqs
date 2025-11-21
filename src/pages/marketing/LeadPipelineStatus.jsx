import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";

/* ------------------- Styled Components ------------------- */
const SegmentsTrack = styled("div")(({ theme }) => ({
  padding: 8,
  borderRadius: 20,
  border: `2px solid ${theme.palette.divider}`,
  background: theme.palette.grey[100],
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  overflowX: "auto",
}));

const Segment = styled("div", {
  shouldForwardProp: (prop) => prop !== "bg" && prop !== "faded",
})(({ bg, faded }) => {
  const H = 44;
  const R = 22;
  const TW = 18;
  const fadedBg = "#e5e7eb";
  const fadedColor = "#6b7280";
  return {
    position: "relative",
    height: H,
    lineHeight: `${H}px`,
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 800,
    color: faded ? fadedColor : "#fff",
    background: faded ? fadedBg : bg,
    padding: "0 18px 0 20px",
    borderRadius: R,
    marginRight: 18,
    marginBottom: 12,
    userSelect: "none",
    whiteSpace: "nowrap",
    fontSize: 15,
    opacity: faded ? 0.85 : 1,
    transition: "all 0.3s ease",
    "::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: -TW,
      width: 0,
      height: 0,
      borderTop: `${H / 2}px solid transparent`,
      borderBottom: `${H / 2}px solid transparent`,
      borderLeft: `${TW}px solid ${faded ? fadedBg : bg}`,
    },
  };
});

const Dot = styled("span")({
  width: 8,
  height: 8,
  borderRadius: "50%",
  display: "inline-block",
  background: "#fff",
  marginRight: 10,
});

/* ------------------- Component ------------------- */
export default function LeadPipelineStatus({ expanded, onToggle, stages, activeIndex }) {
  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "white",
        boxShadow: "none",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 900 }}>
        Lead Pipeline Status
      </AccordionSummary>
      <AccordionDetails>
        <SegmentsTrack>
          {stages.map((stg, i) => (
            <Segment key={stg.id} bg={stg.color} faded={i > activeIndex}>
              <Dot />
              {stg.label}
            </Segment>
          ))}
        </SegmentsTrack>
      </AccordionDetails>
    </Accordion>
  );
}
