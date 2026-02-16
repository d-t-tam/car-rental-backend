import corsLib from "cors";

export const cors = () => {
  return corsLib({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  });
};
