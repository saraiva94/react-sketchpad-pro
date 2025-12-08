import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Projects from "../pages/projects/page";
import ProjectDetail from "../pages/projects/[id]/page";
import EditProject from "../pages/projects/[id]/edit/page";
import Auth from "../pages/auth/page";
import Dashboard from "../pages/dashboard/page";
import Contact from "../pages/contact/page";
import MessagesPage from '../pages/messages/page'

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/projects/:id",
    element: <ProjectDetail />,
  },
  {
    path: "/projects/:id/edit",
    element: <EditProject />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/messages",
    element: <MessagesPage />
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
