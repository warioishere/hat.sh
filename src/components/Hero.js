/* eslint-disable @next/next/no-img-element */
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { getTranslations as t } from "../../locales";

export default function Hero() {
  return (
    <Container maxWidth="sm" component="main">
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: "diamondBlack.main", mt: "20px" }}
      >
        {"Hat.sh"}
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        component="p"
        sx={{ color: "diamondBlack.main" }}
      >
        {t("sub_title")}
        <br />
      </Typography>
    </Container>
  );
}
