import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import EncryptionPanel from "./EncryptionPanel";
import DecryptionPanel from "./DecryptionPanel";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { getTranslations as t } from "../../locales";

const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  padding: "8px",
  transition: "background-color 0.2s ease-out",
  color: theme.palette.mineShaft.main,

  "&.Mui-selected": {
    backgroundColor: theme.palette.white.main,
    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
    borderRadius: "8px",
    color: theme.palette.mineShaft.main,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default function CustomizedTabs() {
  const router = useRouter();
  const query = router.query;
  const [value, setValue] = useState(0);
  const encryption = { tab: 0, label: t("encryption") };
  const decryption = { tab: 1, label: t("decryption") };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    router.replace(router.pathname);
  };

  useEffect(() => {
    if (query.tab && query.tab === "encryption") {
      setValue(encryption.tab);
    }

    if (query.tab && query.tab === "decryption") {
      setValue(decryption.tab);
    }
  }, [decryption.tab, encryption.tab, query.tab]);

  return (
    <>
      <Container style={{ maxWidth: "768px" }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            mt: "35px",
            backgroundColor: "#ebebeb",
            borderRadius: "8px",
            p: 1,
          }}
        >
          <StyledTabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            centered
          >
            <StyledTab label={encryption.label} disableRipple />
            <StyledTab label={decryption.label} disableRipple />
          </StyledTabs>
        </AppBar>

        <TabPanel value={value} index={encryption.tab} style={{ marginTop: 15 }}>
          <EncryptionPanel />
        </TabPanel>
        <TabPanel value={value} index={decryption.tab} style={{ marginTop: 15 }}>
          <DecryptionPanel />
        </TabPanel>
      </Container>
    </>
  );
}
