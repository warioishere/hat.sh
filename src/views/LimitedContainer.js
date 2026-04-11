import { styled } from "@mui/material/styles";
import NavAppBar from "../components/AppBar";
import Hero from "../components/Hero";
import LimitedPanels from "../components/limited/LimitedPanels";
import Footer from "../components/Footer";

const Body = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.alabaster.main,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const LimitedContainer = () => {
  return (
    <Body>
      <NavAppBar />
      <Hero />
      <LimitedPanels />
      <Footer />
    </Body>
  );
};

export default LimitedContainer;
