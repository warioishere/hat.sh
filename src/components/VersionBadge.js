import { currentVersion } from "../config/Constants";
import Chip from "@mui/material/Chip";

const VersionBadge = () => {
  return (
    <Chip
      label={"v" + currentVersion}
      size="small"
      sx={{
        backgroundColor: "gallery.main",
        color: "mountainMist.main",
        borderRadius: ".25rem",
        padding: "none",
        ml: "15px",
        mb: "10px",
      }}
    />
  );
};

export default VersionBadge;
