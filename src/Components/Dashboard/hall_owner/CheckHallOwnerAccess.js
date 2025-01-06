import { useEffect } from "react";
import { useHistory } from "react-router-dom";

const CheckHallOwnerAccess = () => {
  const history = useHistory();

  useEffect(() => {
    const role = localStorage.getItem("role");
    console.log(role);

    if (role !== "HALL_OWNER") {
      history.push("/unauthorized"); // Redirect to unauthorized if not HALL_OWNER
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, [history]);

  return null; // This component does not render anything
};

export default CheckHallOwnerAccess;
