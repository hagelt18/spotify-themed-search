import { getParamValues } from "../utils/functions";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthContext } from "../context/authContext";

// export default class RedirectPage extends React.Component {
const RedirectPage = () => {
  // componentDidMount() {
  const navigate = useNavigate();
  const location = useLocation();
  // const setExpiryTime = useParams();
  const { setExpiryTime } = useAuthContext();

  useEffect(() => {
    // console.log("wow");
    // const { setExpiryTime, history, location } = this.props;

    try {
      if (!location.hash) {
        return navigate("/search");
      }

      const access_token = getParamValues(location.hash);
      const expiryTime = new Date().getTime() + access_token.expires_in * 1000;
      localStorage.setItem("params", JSON.stringify(access_token));
      localStorage.setItem("expiry_time", expiryTime.toString());
      setExpiryTime(expiryTime);
      navigate("/search");
    } catch (error) {
      navigate("/");
    }
  }, [location.hash, navigate, setExpiryTime]);

  // render() {
  //   return null;
  // }
  return null;
};

export default RedirectPage;
