/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import fs from "fs";
import path from "path";
import { marked } from "marked";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import Footer from "../src/components/Footer";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import StarsIcon from "@mui/icons-material/Stars";
import GetAppIcon from "@mui/icons-material/GetApp";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import HistoryIcon from "@mui/icons-material/History";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import prism from "prismjs";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";
import Settings from "../src/components/Settings";
import { getInitialMode } from "../src/config/Theme";
import locales from "../locales/locales";
import { getTranslations as t } from "../locales";
const drawerWidth = 240;

marked.use(gfmHeadingId());
marked.use(
  markedHighlight({
    highlight: function (code, lang) {
      if (prism.languages[lang]) {
        return prism.highlight(code, prism.languages[lang], lang);
      }
      return code;
    },
  })
);

const contentSx = {
  padding: "24px",
  marginTop: "20px",

  "& h1": {
    marginTop: "20px",
    color: "#3f3f3f",
    borderRadius: "8px",
    paddingBottom: "15px",
    "& a": {
      textDecoration: "none",
      fontWeight: "bold",
      fontSize: 40,
      letterSpacing: "1px",
      borderBottom: "1px solid #000",
    },
  },

  "& h2": {
    color: "#3f3f3f",
    fontSize: "26px",
    paddingTop: "20px",
    paddingBottom: "20px",
    fontWeight: "700",
  },

  "& h3": {
    color: "#3f3f3f",
    fontSize: "24px",
    paddingTop: "20px",
    paddingBottom: "20px",
    fontWeight: "700",
  },

  "& a": {
    color: "#3f3f3f",
  },

  "& p": {
    fontSize: "17px",
    color: "#3f3f3f",
    lineHeight: 2,
    "& code": {
      backgroundColor: "#f1f1f1",
      wordWrap: "break-word",
      fontFamily: "inherit",
      paddingRight: "7px",
      paddingLeft: "7px",
      borderRadius: "3px",
    },
  },

  "& li": {
    padding: "2.5px",
    fontSize: "18px",
    color: "#3f3f3f",
    "& a": {
      textDecoration: "none",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #000",
    },
  },

  "& hr": {
    backgroundColor: "#e9e9e9",
    border: "none",
    height: "1.5px",
    marginTop: "20px",
    marginBottom: "30px",
  },

  "& ul": {
    paddingLeft: "25px",
    paddingBottom: "15px",
    fontSize: "16px",
    "& code": {
      backgroundColor: "#f1f1f1",
      wordWrap: "break-word",
      fontFamily: "inherit",
      paddingRight: "7px",
      paddingLeft: "7px",
      borderRadius: "3px",
    },
  },

  "& ol": {
    paddingLeft: "25px",
    paddingBottom: "15px",
    fontSize: "16px",
    "& code": {
      backgroundColor: "#f1f1f1",
      wordWrap: "break-word",
      fontFamily: "inherit",
      paddingRight: "7px",
      paddingLeft: "7px",
      borderRadius: "3px",
    },
  },

  "& pre": {
    background: "rgb(235, 235, 235)",
    padding: "13px",
    marginTop: "-5px",
    marginBottom: "20px",
    lineHeight: "1.3",
    fontSize: "14px",
    borderRadius: "3px",
    overflow: "auto",
    "& code": {
      color: "#3f3f3f",
    },
  },

  '& pre[class*="language-"]': {
    background: "#2E3440",
    "& code": {
      color: "#f8f8f2",
    },
  },

  "& blockquote": {
    backgroundColor: "#f1f1f1",
    marginTop: "15px",
    color: "#535a60",
    borderLeft: "5px solid #c8ccd0",
    marginBottom: "20px",
    "& p": {
      padding: "10px",
    },
  },
};

export default function About(props) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [docContent, setDocContent] = useState("");

  useEffect(() => {
    const getLocale = () => {
      if (typeof window !== "undefined") {
        let language = window.localStorage.getItem("language");
        let userLanguage = navigator.language.replace("-", "_");
        return language ? language : locales[userLanguage] ? userLanguage : "en_US";
      }
    };

    let languages = props.docs;
    let langFilter = { lang: getLocale() };
    let langResult;

    languages.forEach(function (obj) {
      let matches = true;
      for (let key in langFilter) {
        if (langFilter[key] !== obj[key]) {
          matches = false;
        }
      }
      if (matches) {
        langResult = obj;
      } else {
        //default en docs
        setDocContent(languages[0].content);
      }
    });

    const getContent = async () => {
      for (const key in langResult) {
        if (key == "content") {
          setDocContent(langResult[key]);
        }
      }
    };

    getContent();
  }, [props.docs]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClose = () => {
    mobileOpen ? setMobileOpen(false) : null;
  };

  const drawer = (
    <div>
      <Toolbar />

      <List>
        <ListItem button component="a">
          <ListItemText primary="Hat.sh Documentation" />
        </ListItem>
      </List>

      <Divider />
      <List>
        {[
          { name: t("introduction"), anchor: "introduction", icon: <BookmarkBorderIcon /> },
          { name: t("features"), anchor: "features", icon: <StarsIcon /> },
          { name: t("installation"), anchor: "installation", icon: <GetAppIcon /> },
          { name: t("usage"), anchor: "usage", icon: <EmojiObjectsIcon /> },
          { name: "P2P Transfer", anchor: "p2p-transfer", icon: <SyncAltIcon /> },
          { name: t("limitations"), anchor: "limitations", icon: <ErrorOutlineIcon /> },
          { name: t("best_practices"), anchor: "best-practices", icon: <VerifiedUserIcon /> },
          { name: t("faq"), anchor: "faq", icon: <LiveHelpIcon /> },
          { name: t("technical_details"), anchor: "technical-details", icon: <MenuBookIcon /> },
          { name: t("changelog"), anchor: "changelog", icon: <HistoryIcon /> },
        ].map((text, index) => (
          <a
            href={"#" + text.anchor}
            key={index}
            onClick={(e) => {
              e.preventDefault();
              handleClose();
              const el = document.getElementById(text.anchor);
              if (el) {
                const offset = 80;
                const top = el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
              }
            }}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <ListItem button>
              <ListItemIcon>{text.icon}</ListItemIcon>
              <ListItemText primary={text.name} />
            </ListItem>
          </a>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#fafafa",
          minHeight: "100vh",
        }}
      >
        <CssBaseline />

        <AppBar
          color="transparent"
          position="fixed"
          sx={{
            backgroundColor: "#fafafa",
            width: { sm: "100%" },
            marginLeft: { sm: `${drawerWidth}px` },
            zIndex: { sm: 1199 },
          }}
          elevation={0}
        >
          <Container maxWidth="lg">
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  marginRight: "16px",
                  display: { xl: "none" },
                }}
              >
                <MenuIcon />
              </IconButton>

              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  marginTop: "5px",
                }}
              >
                <a href="/">
                  <img src="/assets/images/logo.png" alt="logo" width="40" />
                </a>
              </Typography>

              <Button
                color="inherit"
                href="/"
                sx={{
                  textTransform: "none",
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                {t('home')}
              </Button>

              <IconButton
                href="https://github.com/warioishere/hat.sh"
                target="_blank"
                rel="noopener"
              >
                <GitHubIcon />
              </IconButton>

              <Settings />
            </Toolbar>
          </Container>
        </AppBar>

        <nav aria-label="mailbox folders">
          {/* Mobile drawer - opens via hamburger menu */}
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer - permanent sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", lg: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </nav>
        <Box component="main" sx={contentSx}>
          <Container maxWidth="lg">
            <Toolbar />

            <div dangerouslySetInnerHTML={{ __html: marked(docContent) }}></div>
            <div
              dangerouslySetInnerHTML={{ __html: marked(props.changelog) }}
            ></div>
          </Container>
        </Box>

        <Footer />
      </Box>
    </>
  );
}

About.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export async function getStaticProps() {
  // Get files from the posts dir

  let docs = [];

  {
    Object.entries(locales).map(([code, name]) => {
      let docFilePath = `locales/${code}/docs.md`;
      let docFile;
      try {
        docFile = fs.readFileSync(
          path.join(docFilePath),
          "utf-8"
        );
      } catch (error) {
        docFile = fs.readFileSync(
          path.join(`locales/en_US/docs.md`),
          "utf-8"
        );
      }

      let docStructure = { lang: code, content: docFile };
      docs.push(docStructure);
    });
  }

  const changelog = fs.readFileSync("CHANGELOG.md", "utf-8");

  return {
    props: {
      docs: docs,
      changelog: changelog,
    },
  };
}
