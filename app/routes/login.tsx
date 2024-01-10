import React, { useState} from "react";
import { Paper, TextInput, PasswordInput, Button, Title, Text } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import classes from "~/style/AuthenticationImage.module.css";
import pb from "../lib/pocketbase";

export function links() {
  return [{ rel: "stylesheet", href: classes }];
}

interface TouchState {
  email: boolean;
  password: boolean;
}

const AuthenticationImage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isTouched, setIsTouched] = useState<TouchState>({ email: false, password: false });

  const navigate = useNavigate();

  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    setIsTouched({ email: true, password: true });

    if (!email || !password) {
      setError("Prosím vyplňte všechna pole");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Prosím zadejte platný email");
      return;
    }

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      console.log("Authentication Successful", authData);
      console.log(authData.token);
      //localStorage.setItem("token", authData.token);
      navigate("/app/home");
    } catch (err) {
      if (err instanceof Error) {
        setError("Nepodařilo se přihlásit, zkuste to prosím znovu");
      } else {
        setError("Nastala chyba, zkuste to prosím znovu později");
      }
    }
  };

  const emailClasses = `${classes.input} ${isTouched.email && (!email || !isValidEmail(email)) ? classes.error : ''}`;
  const passwordClasses = `${classes.input} ${isTouched.password && !password ? classes.error2 : ''}`;

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Vítejte zpět
        </Title>

        <TextInput 
          label="Email:" 
          placeholder="Váš email" 
          size="md"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          className={emailClasses}
        />
        <PasswordInput
          label="Heslo:"
          placeholder="Vaše heslo"
          mt="md"
          size="md"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          className={passwordClasses}
        />
        <Button fullWidth mt="xl" size="md" onClick={handleLogin}>
          Přihlásit se
        </Button>

        {error && <Text color="red" mt="md">{error}</Text>}

        <Text ta="center" mt="md">
          Nemáte účet? <Link to="/register">Registrovat se</Link>
        </Text>
      </Paper>
    </div>
  );
}

export default AuthenticationImage;