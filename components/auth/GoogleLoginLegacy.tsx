import { GoogleLogin } from 'react-google-login';

const GoogleLoginComponent = () => {
  const handleSuccess = (response: any) => {
    console.log('Google Login Success:', response);
    
    // El ID Token está en response.tokenId
    const idToken = response.tokenId;
    const userInfo = response.profileObj;
    
    console.log('ID Token:', idToken);
    console.log('User Info:', userInfo);
    
    // Enviar a tu API
    sendToAPI(idToken);
  };

  const handleFailure = (response: any) => {
    console.error('Google Login Failed:', response);
  };

  const sendToAPI = async (idToken: string) => {
    try {
      const response = await fetch('https://localhost:7283/api/usuarios/iniciarSesionConGoogle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
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
