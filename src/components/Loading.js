/* eslint-disable @next/next/no-img-element */
import { styled, keyframes } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";

const spin = keyframes`
  100% { transform: rotateZ(360deg); }
`;

const bounce = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  backgroundColor: theme.palette.alabaster.main,
  opacity: "96%",
  zIndex: 10,
  color: theme.palette.mineShaft.main,
}));

const LoadingWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const Circle = styled("div")({
  position: "absolute",
  width: 250,
  height: 250,
  border: "4px dashed",
  borderRadius: "50%",
  animation: `${spin} 5s linear infinite`,
});

const LoadingImg = styled("img")({
  position: "absolute",
  width: 150,
  animation: `${bounce} 1.5s linear infinite`,
});

const LoadingText = styled("samp")({
  position: "absolute",
  bottom: "15%",
});

const LoadingCom = (props) => {
  return (
    <StyledBackdrop open={props.open}>
      <LoadingWrapper>
        <Circle />
        <LoadingImg src="/assets/images/logo.png" alt="Loading..." />
        <LoadingText>Loading...</LoadingText>
      </LoadingWrapper>
    </StyledBackdrop>
  );
};

export default LoadingCom;
