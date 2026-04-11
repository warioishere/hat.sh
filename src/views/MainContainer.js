import { styled } from "@mui/material/styles";
import NavAppBar from "../components/AppBar";
import Hero from "../components/Hero";
import Panels from "../components/Panels";
import Footer from "../components/Footer";
import CheckMultipleTabs from "../config/CheckMultipleTabs";

const Body = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.alabaster.main,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const MainContainer = () => {
  return (
    <Body>
      <CheckMultipleTabs />
      <NavAppBar />
      <Hero />
      <Panels />
      <Footer />
    </Body>
  );
};

export default MainContainer;
