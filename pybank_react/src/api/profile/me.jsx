export async function fetchUserInfo() {
    const apiKey = import.meta.env.VITE_URL_BACKEND;
    const token = localStorage.getItem("token");
  
    if (!token) {
      throw new Error("Vous n'êtes pas connecté.");
    }
  
    const response = await fetch(`${apiKey}/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors de la récupération des informations utilisateur"
      );
    }
  
    const data = await response.json();
    return data; // Retourne directement les données utilisateur
  }
  