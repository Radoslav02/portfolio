import { createHashRouter } from "react-router-dom";
import App from "../../App";
import Landing from "../Scrolling/Landing";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: "home", element: <Landing /> },
      { path: "about", element: <Landing /> },
      { path: "skills", element: <Landing /> },
      { path: "work", element: <Landing /> },
      { path: "contact", element: <Landing /> },
    ],
  },
]);
