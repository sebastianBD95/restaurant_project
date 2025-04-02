export interface AuthResponse {
    token?: string;
    message?: string;
  }
  
  export interface UserCredentials {
    username: string;
    password: string;
  }

  export interface UserData {
    name: string;
    email: string;
    idNumber: string;
    phone: string;
    companyName: string;
    nitNumber: string;
    password: string;
  }
  