export function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      localStorage.removeItem("token"); 
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("token"); 
    return false;
  }
}


export const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};