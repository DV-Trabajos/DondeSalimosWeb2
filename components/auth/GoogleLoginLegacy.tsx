import { GoogleLogin, type GoogleLoginResponse } from 'react-google-login';

const GoogleLoginComponent = () => {
  const handleSuccess = (response: GoogleLoginResponse) => {    

    // El ID Token está en response.tokenId
    const idToken = response.tokenId;
    //const userInfo = response.profileObj;
    
    // Enviar a tu API
    sendToAPI(idToken);
  };

  const handleFailure = (error: Error) => {
    console.error('Google Login Failed:', error);
  };

  const sendToAPI = async (idToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios/iniciarSesionConGoogle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await response.json();
    } catch (error: unknown) {
      console.error('API Error:', error);
    }
  };

  return (
    <GoogleLogin
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      buttonText="Iniciar sesión con Google"
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      cookiePolicy={'single_host_origin'}
      responseType="code,token"
    />
  );
};

export default GoogleLoginComponent;
